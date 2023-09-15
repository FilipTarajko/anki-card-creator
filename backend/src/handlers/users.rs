use axum::http::StatusCode;
use axum::{extract::State, Json};
use mongodb::{bson::doc, Client, Collection};
use regex::Regex;
use serde::{Deserialize, Serialize};

const ARGON_CONFIG: argon2::Config<'_> = argon2::Config {
    variant: argon2::Variant::Argon2i,
    version: argon2::Version::Version13,
    mem_cost: 65536,
    time_cost: 10,
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
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegistrationFormData {
    pub username: String,
    pub email: String,
    pub password: String,
}

pub async fn register_user(
    State(client): State<Client>,
    registration_form_data: Json<RegistrationFormData>,
) -> Result<String, StatusCode> {
    let user_collection: Collection<User> = client
        .database(std::env::var("DATABASE_NAME").unwrap().as_str())
        .collection(std::env::var("COLLECTION_NAME").unwrap().as_str());

    let mut user_to_insert = User {
        id: None,
        is_admin: false,
        username: registration_form_data.username.clone(),
        email: registration_form_data.email.clone(),
        password: registration_form_data.password.clone(),
        failed_login_attempts: 0,
    };

    println!("{:?}", user_to_insert);

    let email_regex = Regex::new(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$").unwrap();
    let username_regex = Regex::new(r"^[a-zA-Z0-9_]+$").unwrap();
    if !email_regex.is_match(&user_to_insert.email)
        || !username_regex.is_match(&user_to_insert.username)
        || user_to_insert.username.len() < 3
        || user_to_insert.password.len() < 8
    {
        return Err(StatusCode::BAD_REQUEST);
    }

    match user_collection
        .find_one(doc! { "email": &user_to_insert.email }, None)
        .await
    {
        Ok(Some(_)) => return Err(StatusCode::BAD_REQUEST),
        Ok(None) => {}
        Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
    }

    match user_collection
        .find_one(doc! { "username": &user_to_insert.username }, None)
        .await
    {
        Ok(Some(_)) => return Err(StatusCode::BAD_REQUEST),
        Ok(None) => {}
        Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
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
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}
