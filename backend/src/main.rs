use axum::{
    http::{HeaderValue, Method},
    response::Html,
    routing::get,
    Router,
};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    let app = Router::new().route(
        "/check_connection_to_backend",
        get(check_connection_to_backend).layer(
            CorsLayer::new()
                .allow_origin("http://localhost:5173".parse::<HeaderValue>().unwrap())
                .allow_methods([Method::GET]),
        ),
    );

    let addr = SocketAddr::from(([127, 0, 0, 1], 3001));

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn check_connection_to_backend() -> Html<&'static str> {
    Html("Hello World!")
}
