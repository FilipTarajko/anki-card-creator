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
use std::collections::BTreeSet;

use crate::handlers::jwt::get_user_by_jwt;
use crate::handlers::users::User;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Field {
    pub id: i32,
    pub name: String,
    pub r#type: String,
    pub options: Vec<String>,
    pub default: Vec<String>,
    pub current_inputs: Vec<String>,
    pub visible_by_default: bool,
    pub frozen_by_default: Option<bool>,
    pub expanded_in_editor: Option<bool>,
    pub currently_visible: Option<bool>,
    pub currently_frozen: Option<bool>,
    pub bound_to: Option<i32>,
    pub bindings: Option<Vec<Vec<String>>>,
    pub binding_type: Option<String>,
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
            "frozen_by_default": field.frozen_by_default,
            "expanded_in_editor": field.expanded_in_editor,
            "currently_visible": field.currently_visible,
            "currently_frozen": field.currently_frozen,
            "bound_to": field.bound_to,
            "bindings": field.bindings,
            "binding_type": field.binding_type,
        })
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Preset {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<mongodb::bson::oid::ObjectId>,
    pub name: String,
    pub fields: Vec<Field>,
    pub last_edited: i64,
    pub status: String,
    pub hue: String,
    pub iframe: Option<String>,
    pub iframes: Option<Vec<Vec<String>>>,
}

impl From<Preset> for Bson {
    fn from(preset: Preset) -> Self {
        let id_to_set = match preset.id {
            Some(id) => id,
            _ => mongodb::bson::oid::ObjectId::new(),
        };
        Bson::Document(doc! {
            "_id": id_to_set,
            "name": preset.name,
            "fields": preset.fields,
            "last_edited": preset.last_edited,
            "status": "synced".to_string(),
            "hue": preset.hue,
            "iframe": preset.iframe,
            "iframes": preset.iframes,
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

fn append_unique_elements_to_vector<T: std::cmp::PartialEq>(mut vec1: Vec<T>, vec2: Vec<T>) -> Vec<T> {
    for elem in vec2 {
        if !vec1.contains(&elem) {
            vec1.push(elem);
        }
    }
    vec1
}

fn remove_common_elements_from_vector<T: std::cmp::Eq + std::cmp::Ord + std::clone::Clone>(vec1: Vec<T>, vec2: Vec<T>) -> Vec<T> {
    BTreeSet::from_iter(vec1).difference(&BTreeSet::from_iter(vec2)).cloned().collect()
}

pub async fn sync_unique_questions(
    State(client): State<Client>,
    TypedHeader(auth_header): TypedHeader<Authorization<Bearer>>,
    Json(unique_questions_to_add): Json<Vec<String>>,
) -> Json<Vec<String>> {
    let authenticated_user = get_user_by_jwt(State(client.clone()), TypedHeader(auth_header))
        .await
        .unwrap();
    let user_collection: Collection<User> = client
        .database(std::env::var("DATABASE_NAME").unwrap().as_str())
        .collection("Users");
    user_collection
        .update_one(
            doc! {"_id": authenticated_user.id.unwrap()},
            doc! {"$set": {"unique_questions": append_unique_elements_to_vector(authenticated_user.unique_questions, unique_questions_to_add)}},
            None,
        )
        .await
        .unwrap();
    let loaded_user = user_collection
        .find_one(doc! {"_id": authenticated_user.id.unwrap()}, None)
        .await
        .unwrap()
        .unwrap();
    Json(loaded_user.unique_questions)
}

pub async fn sync_prompts(
    State(client): State<Client>,
    TypedHeader(auth_header): TypedHeader<Authorization<Bearer>>,
    Json((prompts_to_add, prompts_to_delete)): Json<(Vec<String>, Vec<String>)>,
) -> Json<Vec<String>> {
    let authenticated_user = get_user_by_jwt(State(client.clone()), TypedHeader(auth_header))
        .await
        .unwrap();
    let user_collection: Collection<User> = client
        .database(std::env::var("DATABASE_NAME").unwrap().as_str())
        .collection("Users");
    user_collection
        .update_one(
            doc! {"_id": authenticated_user.id.unwrap()},
            doc! {"$set": {"prompts": append_unique_elements_to_vector(remove_common_elements_from_vector(authenticated_user.prompts, prompts_to_delete), prompts_to_add)}},
            None,
        )
        .await
        .unwrap();
    let loaded_user = user_collection
        .find_one(doc! {"_id": authenticated_user.id.unwrap()}, None)
        .await
        .unwrap()
        .unwrap();
    Json(loaded_user.prompts)
}

pub async fn delete_unique_questions(
    State(client): State<Client>,
    TypedHeader(auth_header): TypedHeader<Authorization<Bearer>>
) -> String {
    let authenticated_user = get_user_by_jwt(State(client.clone()), TypedHeader(auth_header))
        .await
        .unwrap();
    let user_collection: Collection<User> = client
        .database(std::env::var("DATABASE_NAME").unwrap().as_str())
        .collection("Users");
    user_collection
        .update_one(
            doc! {"_id": authenticated_user.id.unwrap()},
            doc! {"$set": {"unique_questions": Vec::<String>::new()}},
            None,
        )
        .await
        .unwrap();

    "Unique questions deleted!".to_string()
}

pub async fn delete_prompts(
    State(client): State<Client>,
    TypedHeader(auth_header): TypedHeader<Authorization<Bearer>>
) -> String {
    let authenticated_user = get_user_by_jwt(State(client.clone()), TypedHeader(auth_header))
        .await
        .unwrap();
    let user_collection: Collection<User> = client
        .database(std::env::var("DATABASE_NAME").unwrap().as_str())
        .collection("Users");
    user_collection
        .update_one(
            doc! {"_id": authenticated_user.id.unwrap()},
            doc! {"$set": {"prompts": Vec::<String>::new()}},
            None,
        )
        .await
        .unwrap();

    "All prompts deleted!".to_string()
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

// pub async fn upload_presets(
//     State(client): State<Client>,
//     TypedHeader(auth_header): TypedHeader<Authorization<Bearer>>,
//     Json(presets): Json<Vec<Preset>>,
// ) -> String {
//     let user = get_user_by_jwt(State(client.clone()), TypedHeader(auth_header))
//         .await
//         .unwrap();
//     let user_collection: Collection<User> = client
//         .database(std::env::var("DATABASE_NAME").unwrap().as_str())
//         .collection("Users");
//     user_collection
//         .update_one(
//             doc! {"_id": user.id.unwrap()},
//             doc! {"$set": {"presets": presets}},
//             None,
//         )
//         .await
//         .unwrap();

//     "Presets uploaded!".to_string()
// }

// pub async fn load_presets(
//     State(client): State<Client>,
//     TypedHeader(auth_header): TypedHeader<Authorization<Bearer>>,
// ) -> Json<Vec<Preset>> {
//     let user = get_user_by_jwt(State(client.clone()), TypedHeader(auth_header))
//         .await
//         .unwrap();

//     Json(user.presets)
// }

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PresetSyncReport {
    number_of_accepted_changes: i32,
    number_of_new_presets: i32,
    ignored_presets: Vec<String>,
    unfound_presets: Vec<String>,
}

pub async fn sync_presets(
    State(client): State<Client>,
    TypedHeader(auth_header): TypedHeader<Authorization<Bearer>>,
    Json((presets_to_add, presets_to_edit, presets_to_remove)): Json<(
        Vec<Preset>,
        Vec<Preset>,
        Vec<mongodb::bson::oid::ObjectId>,
    )>,
) -> Json<(PresetSyncReport, Vec<Preset>)> {
    let number_of_new_presets = presets_to_add.len() as i32;
    let mut ignored_presets = vec![];
    let mut unfound_presets = vec![];

    let user = get_user_by_jwt(State(client.clone()), TypedHeader(auth_header))
        .await
        .unwrap();
    let user_collection: Collection<User> = client
        .database(std::env::var("DATABASE_NAME").unwrap().as_str())
        .collection("Users");
    let mut presets_to_save = user.presets;
    for preset_to_remove in &presets_to_remove {
        presets_to_save.retain(|preset| preset.id != Some(*preset_to_remove));
    }
    'needle: for needle_preset in &presets_to_edit {
        for hay_preset in &mut presets_to_save {
            if hay_preset.id == needle_preset.id {
                if hay_preset.last_edited < needle_preset.last_edited {
                    hay_preset.name = needle_preset.name.clone();
                    hay_preset.fields = needle_preset.fields.clone();
                    hay_preset.last_edited = needle_preset.last_edited;
                    hay_preset.status = "synced".to_string();
                    hay_preset.hue = needle_preset.hue.clone();
                    hay_preset.iframe = needle_preset.iframe.clone();
                    hay_preset.iframes = needle_preset.iframes.clone();
                } else {
                    ignored_presets.push(hay_preset.name.clone());
                }
                continue 'needle;
            }
        }
        unfound_presets.push(needle_preset.name.clone());
    }
    presets_to_save.append(&mut presets_to_add.clone());
    for preset in &mut presets_to_save {
        preset.status = "synced".to_string();
    }
    user_collection
        .update_one(
            doc! {"_id": user.id.unwrap()},
            doc! {"$set": {"presets": &presets_to_save}},
            None,
        )
        .await
        .unwrap();

    let sync_report = PresetSyncReport {
        number_of_accepted_changes: presets_to_edit.len() as i32
            - ignored_presets.len() as i32
            - unfound_presets.len() as i32,
        number_of_new_presets,
        ignored_presets,
        unfound_presets,
    };
    if number_of_new_presets > 0 {
        let maybe_user_reloaded = user_collection.find_one(doc! { "_id": user.id.unwrap() }, None)
        .await
        .unwrap();
        if let Some(user_reloaded) = maybe_user_reloaded {
            return Json((sync_report, user_reloaded.presets));
        }
    }
    return Json((sync_report, presets_to_save));
}
