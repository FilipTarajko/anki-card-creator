#![allow(unused_imports)]
use axum::headers::authorization::Bearer;
use axum::headers::Authorization;
use axum::http::StatusCode;
use axum::TypedHeader;
use axum::{extract::State, Json};
use mongodb::bson::Bson;
use mongodb::{bson::doc, Client, Collection};
use regex::Regex;
use serde::{Deserialize, Serialize};

use crate::handlers::jwt::get_user_by_jwt;
use crate::handlers::users::User;

#[derive(Serialize, Deserialize, Debug)]
pub struct Field {
    pub id: i32,
    pub name: String,
    pub r#type: String,
    pub options: Vec<String>,
    pub default: Vec<String>,
    pub current_inputs: Vec<String>,
    pub visible_by_default: bool,
    pub currently_visible: Option<bool>,
    pub currently_frozen: Option<bool>,
}

impl From<Field> for Bson {
    fn from(field: Field) -> Self {
        Bson::Document(doc! {
            "id": field.id,
            "name": field.name,
            "type": field.r#type,
            "options": field.options,
            "default": field.default,
            "current_inputs": field.current_inputs,
            "visible_by_default": field.visible_by_default,
            "currently_visible": field.currently_visible,
            "currently_frozen": field.currently_frozen,
        })
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Preset {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<mongodb::bson::oid::ObjectId>,
    pub name: String,
    pub fields: Vec<Field>,
    pub last_edited: i64,
}

impl From<Preset> for Bson {
    fn from(preset: Preset) -> Self {
        let id_to_set = match preset.id {
            Some(id) => id,
            None => mongodb::bson::oid::ObjectId::new(),
        };
        Bson::Document(doc! {
            "_id": id_to_set,
            "name": preset.name,
            "fields": preset.fields,
            "last_edited": preset.last_edited,
        })
    }
}

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

pub async fn upload_presets(
    State(client): State<Client>,
    TypedHeader(auth_header): TypedHeader<Authorization<Bearer>>,
    Json(presets): Json<Vec<Preset>>,
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
            doc! {"$set": {"presets": presets}},
            None,
        )
        .await
        .unwrap();

    "Presets uploaded!".to_string()
}

pub async fn load_presets(
    State(client): State<Client>,
    TypedHeader(auth_header): TypedHeader<Authorization<Bearer>>,
) -> Json<Vec<Preset>> {
    let user = get_user_by_jwt(State(client.clone()), TypedHeader(auth_header))
        .await
        .unwrap();

    Json(user.presets)
}
