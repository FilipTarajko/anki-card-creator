use axum::{
    extract::State,
    http::{HeaderValue, Method},
    response::Html,
    routing::{get, post},
    Json, Router,
};
use dotenv::dotenv;
use mongodb::{Client, Collection};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;

#[derive(Debug, Serialize, Deserialize)]
struct User {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<mongodb::bson::oid::ObjectId>,
    pub is_admin: bool,
    pub username: String,
    pub email: String,
    pub password: String,
    pub failed_login_attempts: i32,
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    let database_client = mongodb::Client::with_uri_str(std::env::var("DATABASE_URI").unwrap())
        .await
        .unwrap();

    let cors_layer: CorsLayer = CorsLayer::new()
        .allow_origin("http://localhost:5173".parse::<HeaderValue>().unwrap())
        // it allows POST?
        .allow_methods([Method::GET]);

    let app = Router::new()
        .route("/add_test_user", post(add_test_user))
        .route("/check_mongo", get(check_mongo))
        .route("/check_backend", get(check_backend))
        .layer(cors_layer)
        .with_state(database_client);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3001));

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn check_backend() -> Html<&'static str> {
    Html("Hello World!")
}

async fn check_mongo(State(client): State<Client>) -> Json<u64> {
    let collection: Collection<User> = client
        .database(std::env::var("DATABASE_NAME").unwrap().as_str())
        .collection(std::env::var("COLLECTION_NAME").unwrap().as_str());
    let estimated_users_count = collection.estimated_document_count(None).await.unwrap();
    Json(estimated_users_count)
}

async fn add_test_user(State(client): State<Client>) -> Html<&'static str> {
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
        .collection(std::env::var("COLLECTION_NAME").unwrap().as_str());
    collection.insert_one(test_user, None).await.unwrap();
    Html("Test user added!")
}
