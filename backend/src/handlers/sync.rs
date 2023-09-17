#![allow(unused_imports)]
use axum::headers::authorization::Bearer;
use axum::headers::Authorization;
use axum::http::StatusCode;
use axum::TypedHeader;
use axum::{extract::State, Json};
use mongodb::{bson::doc, Client, Collection};
use regex::Regex;
use serde::{Deserialize, Serialize};

use crate::handlers::jwt::get_user_by_jwt;
use crate::handlers::users::User;

pub async fn upload_notes(
    State(client): State<Client>,
    TypedHeader(auth_header): TypedHeader<Authorization<Bearer>>,
    Json(notes): Json<String>,
) -> String {
    let user = get_user_by_jwt(State(client.clone()), TypedHeader(auth_header))
        .await
        .unwrap();
    let user_collection: Collection<User> = client
        .database(std::env::var("DATABASE_NAME").unwrap().as_str())
        .collection("Users");
    user_collection
        .update_one(
            doc! {"_id": user.id.unwrap()},
            doc! {"$set": {"notes": notes}},
            None,
        )
        .await
        .unwrap();

    "Notes updated!".to_string()
}

pub async fn download_notes(
    State(client): State<Client>,
    TypedHeader(auth_header): TypedHeader<Authorization<Bearer>>,
) -> Json<String> {
    let user = get_user_by_jwt(State(client.clone()), TypedHeader(auth_header))
        .await
        .unwrap();
    let user_collection: Collection<User> = client
        .database(std::env::var("DATABASE_NAME").unwrap().as_str())
        .collection("Users");
    let user = user_collection
        .find_one(doc! {"_id": user.id.unwrap()}, None)
        .await
        .unwrap()
        .unwrap();
    Json(user.notes)
}

pub async fn delete_notes(
    State(client): State<Client>,
    TypedHeader(auth_header): TypedHeader<Authorization<Bearer>>,
) -> String {
    let user = get_user_by_jwt(State(client.clone()), TypedHeader(auth_header))
        .await
        .unwrap();
    let user_collection: Collection<User> = client
        .database(std::env::var("DATABASE_NAME").unwrap().as_str())
        .collection("Users");
    user_collection
        .update_one(
            doc! {"_id": user.id.unwrap()},
            doc! {"$set": {"notes": ""}},
            None,
        )
        .await
        .unwrap();

    "Notes deleted!".to_string()
}
