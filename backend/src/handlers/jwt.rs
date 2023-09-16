use super::users::User;
use axum::{
    extract::{State, TypedHeader},
    headers::{authorization::Bearer, Authorization},
    http::StatusCode,
};
use mongodb::{bson::doc, Client, Collection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub iss: String,
    pub iat: u64,
    pub exp: u64,
    pub id: String,
    pub email: String,
}

pub async fn generate_jwt(user: User) -> Result<String, StatusCode> {
    let jwt_secret = std::env::var("JWT_SECRET").unwrap();

    let claims = Claims {
        sub: user.username.clone(),
        iss: "AnkiCC".to_string(),
        iat: chrono::Utc::now().timestamp() as u64,
        exp: (chrono::Utc::now() + chrono::Duration::days(180)).timestamp() as u64,
        id: user.id.unwrap().to_hex(),
        email: user.email.clone(),
    };

    let jwt = jsonwebtoken::encode(
        &jsonwebtoken::Header::default(),
        &claims,
        &jsonwebtoken::EncodingKey::from_secret(jwt_secret.as_ref()),
    )
    .unwrap();

    Ok(jwt)
}

pub async fn validate_jwt_from_bearer(
    TypedHeader(auth_header): TypedHeader<Authorization<Bearer>>,
) -> Result<Claims, StatusCode> {
    let decoded = jsonwebtoken::decode::<Claims>(
        auth_header.token(),
        &jsonwebtoken::DecodingKey::from_secret(std::env::var("JWT_SECRET").unwrap().as_ref()),
        &jsonwebtoken::Validation::default(),
    );
    if decoded.is_err() {
        return Err(StatusCode::UNAUTHORIZED);
    }
    let decoded = decoded.unwrap();
    if (decoded.claims.exp as i64 - chrono::Utc::now().timestamp()) < 0 {
        return Err(StatusCode::UNAUTHORIZED);
    }
    if decoded.claims.iss != "AnkiCC" {
        return Err(StatusCode::UNAUTHORIZED);
    }
    if decoded.header.typ != Some("JWT".to_string()) {
        return Err(StatusCode::UNAUTHORIZED);
    }
    if decoded.header.alg != jsonwebtoken::Algorithm::HS256 {
        return Err(StatusCode::UNAUTHORIZED);
    }
    Ok(decoded.claims)
}

pub async fn check_given_token(
    State(client): State<Client>,
    TypedHeader(auth_header): TypedHeader<Authorization<Bearer>>,
) -> Result<String, StatusCode> {
    let claims = validate_jwt_from_bearer(TypedHeader(auth_header))
        .await
        .unwrap();
    let collection: Collection<User> = client
        .database(std::env::var("DATABASE_NAME").unwrap().as_str())
        .collection(std::env::var("COLLECTION_NAME").unwrap().as_str());
    let user = collection
        .find_one(doc! { "username": claims.sub, "email": claims.email }, None)
        .await
        .unwrap()
        .unwrap();
    Ok(format!("Token confirmed! User: {}", user.username))
}
