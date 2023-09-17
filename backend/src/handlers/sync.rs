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
    Json(notes_to_add): Json<String>,
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
            doc! {"$set": {"notes": user.notes+&notes_to_add}},
            None,
        )
        .await
        .unwrap();

    "Notes updated!".to_string()
}

pub async fn sync_notes(
    State(client): State<Client>,
    TypedHeader(auth_header): TypedHeader<Authorization<Bearer>>,
    Json(notes_to_add): Json<String>,
) -> Json<String> {
    let authenticated_user = get_user_by_jwt(State(client.clone()), TypedHeader(auth_header))
        .await
        .unwrap();
    let user_collection: Collection<User> = client
        .database(std::env::var("DATABASE_NAME").unwrap().as_str())
        .collection("Users");
    user_collection
        .update_one(
            doc! {"_id": authenticated_user.id.unwrap()},
            doc! {"$set": {"notes": authenticated_user.notes+&notes_to_add}},
            None,
        )
        .await
        .unwrap();
    let loaded_user = user_collection
        .find_one(doc! {"_id": authenticated_user.id.unwrap()}, None)
        .await
        .unwrap()
        .unwrap();
    Json(loaded_user.notes)
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
