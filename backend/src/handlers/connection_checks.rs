use super::users::User;
use axum::{extract::State, response::Html, Json};
use mongodb::{Client, Collection};

pub async fn check_backend() -> Html<&'static str> {
    Html("Hello World!")
}

pub async fn check_mongo(State(client): State<Client>) -> Json<u64> {
    let collection: Collection<User> = client
        .database(std::env::var("DATABASE_NAME").unwrap().as_str())
        .collection("Users");
    let estimated_users_count = collection.estimated_document_count(None).await.unwrap();
    Json(estimated_users_count)
}

pub async fn add_test_user(State(client): State<Client>) -> Html<&'static str> {
    let test_user = User {
        id: None,
        is_admin: false,
        username: "test".to_string(),
        email: "test@test.test".to_string(),
        password: "test".to_string(),
        failed_login_attempts: 0,
    };

    let collection: Collection<User> = client
        .database(std::env::var("DATABASE_NAME").unwrap().as_str())
        .collection("Users");
    collection.insert_one(test_user, None).await.unwrap();
    Html("Test user added!")
}
