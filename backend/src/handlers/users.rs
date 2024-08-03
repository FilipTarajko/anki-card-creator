use axum::http::StatusCode;
use axum::{extract::State, Json};
use mongodb::{bson::doc, Client, Collection};
use regex::Regex;
use serde::{Deserialize, Serialize};

use super::sync::Preset;

const ARGON_CONFIG: argon2::Config<'_> = argon2::Config {
    variant: argon2::Variant::Argon2id,
    version: argon2::Version::Version13,
    mem_cost: 65536,
    // TODO: how safe is this?
    time_cost: 1,
    lanes: 4,
    secret: &[],
    ad: &[],
    hash_length: 32,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<mongodb::bson::oid::ObjectId>,
    pub is_admin: bool,
    pub username: String,
    pub email: String,
    pub password: String,
    pub failed_login_attempts: i32,
    pub notes: String,
    pub presets: Vec<Preset>,
    pub unique_questions: Vec<String>,
    pub prompts: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegistrationFormData {
    pub username: String,
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginFormData {
    pub username_or_email: String,
    pub password: String,
}

pub async fn register_user(
    State(client): State<Client>,
    registration_form_data: Json<RegistrationFormData>,
) -> Result<String, (StatusCode, String)> {
    let user_collection: Collection<User> = client
        .database(std::env::var("DATABASE_NAME").unwrap().as_str())
        .collection("Users");

    let mut user_to_insert = User {
        id: None,
        is_admin: false,
        username: registration_form_data.username.clone(),
        email: registration_form_data.email.clone(),
        password: registration_form_data.password.clone(),
        failed_login_attempts: 0,
        notes: "".to_string(),
        presets: vec![],
        unique_questions: vec![],
        prompts: vec![],
    };

    let email_regex = Regex::new(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$").unwrap();
    let username_regex = Regex::new(r"^[a-zA-Z0-9_]+$").unwrap();
    if !email_regex.is_match(&user_to_insert.email)
        || !username_regex.is_match(&user_to_insert.username)
        || user_to_insert.username.len() < 3
        || user_to_insert.password.len() < 8
    {
        return Err((StatusCode::BAD_REQUEST, "invalid input".to_string()));
    }

    match user_collection
        .find_one(doc! { "email": &user_to_insert.email }, None)
        .await
    {
        Ok(Some(_)) => return Err((StatusCode::BAD_REQUEST, "email already in use".to_string())),
        Ok(None) => {}
        Err(_) => {
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                "internal server error".to_string(),
            ))
        }
    }

    match user_collection
        .find_one(doc! { "username": &user_to_insert.username }, None)
        .await
    {
        Ok(Some(_)) => {
            return Err((
                StatusCode::BAD_REQUEST,
                "username already in use".to_string(),
            ))
        }
        Ok(None) => {}
        Err(_) => {
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                "internal server error".to_string(),
            ))
        }
    }

    let hashed_password = argon2::hash_encoded(
        user_to_insert.password.as_ref(),
        std::env::var("SALT").unwrap().as_ref(),
        &ARGON_CONFIG,
    )
    .unwrap();

    user_to_insert.password = hashed_password;

    let result = user_collection.insert_one(user_to_insert, None);
    match result.await {
        Ok(_) => Ok("Registered".to_string()),
        Err(_) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            "internal server error".to_string(),
        )),
    }
}

pub async fn login(
    State(client): State<Client>,
    login_form_data: Json<LoginFormData>,
) -> Result<String, (StatusCode, String)> {
    let user_collection: Collection<User> = client
        .database(std::env::var("DATABASE_NAME").unwrap().as_str())
        .collection("Users");

    let user_to_check = match user_collection
        .find_one(
            doc! {
                "$or": [
                    { "username": &login_form_data.username_or_email },
                    { "email": &login_form_data.username_or_email }
                ]
            },
            None,
        )
        .await
    {
        Ok(Some(user)) => user,
        Ok(None) => return Err((StatusCode::BAD_REQUEST, "invalid credentials".to_string())),
        Err(_) => {
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                "internal server error".to_string(),
            ))
        }
    };

    let password_matches = argon2::verify_encoded(
        user_to_check.password.as_ref(),
        login_form_data.password.as_ref(),
    );

    let failed_login_attempts = if password_matches.is_ok() {
        0
    } else {
        user_to_check.failed_login_attempts + 1
    };

    user_collection
        .update_one(
            doc! { "_id": user_to_check.id.unwrap() },
            doc! { "$set": { "failed_login_attempts": failed_login_attempts } },
            None,
        )
        .await
        .unwrap();

    match password_matches {
        Ok(true) => Ok(super::jwt::generate_jwt(user_to_check).await.unwrap()),
        Ok(false) => Err((StatusCode::BAD_REQUEST, "invalid credentials".to_string())),
        Err(_) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            "internal server error".to_string(),
        )),
    }
}
