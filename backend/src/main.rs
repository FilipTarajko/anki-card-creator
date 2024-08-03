use axum::{
    http::Method,
    routing::{get, post},
    Router,
};
use dotenv::dotenv;

use tower_http::cors::{Any, CorsLayer};

mod handlers;
use handlers::{
    connection_checks::{add_test_user, check_backend, check_mongo},
    jwt::check_given_token,
    users::{login, register_user},
};

#[tokio::main]
async fn main() {
    dotenv().ok();

    let database_client = mongodb::Client::with_uri_str(std::env::var("DATABASE_URI").unwrap())
        .await
        .unwrap();

    let cors_layer: CorsLayer = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST])
        .allow_headers(vec![
            axum::http::header::CONTENT_TYPE,
            axum::http::header::AUTHORIZATION,
        ]);

    let app = Router::new()
        .route("/check_token", get(check_given_token))
        .route("/add_test_user", post(add_test_user))
        .route("/check_mongo", get(check_mongo))
        .route("/check_backend", get(check_backend))
        .route("/register_user", post(register_user))
        .route("/login", post(login))
        .route("/upload_notes", post(handlers::sync::upload_notes))
        .route("/sync_notes", post(handlers::sync::sync_notes))
        .route("/delete_notes", post(handlers::sync::delete_notes))
        // .route("/upload_presets", post(handlers::sync::upload_presets))
        // .route("/load_presets", post(handlers::sync::load_presets))
        .route("/sync_presets", post(handlers::sync::sync_presets))
        .route("/sync_unique_questions", post(handlers::sync::sync_unique_questions))
        .route("/delete_unique_questions", post(handlers::sync::delete_unique_questions))
        .layer(cors_layer)
        .with_state(database_client);

    let addr = "[::]:8080".parse().unwrap();

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
