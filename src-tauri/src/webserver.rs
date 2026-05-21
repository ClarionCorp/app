use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::post,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use tower_http::cors::CorsLayer;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerStats {
    orbs: String,
    redirects: String,
    name: String,
    goals: String,
    saves: String,
    damage: String,
    shots: String,
    kos: String,
    assists: String,
}

struct AppState {
    app_handle: AppHandle,
}

async fn handle_postgame(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Vec<PlayerStats>>,
) -> impl IntoResponse {
    println!("Received postgame stats: {:?}", payload);
    
    // Emit event to frontend
    if let Err(e) = state.app_handle.emit("postgame-stats", &payload) {
        eprintln!("Failed to emit event: {}", e);
        return (StatusCode::INTERNAL_SERVER_ERROR, "Failed to emit event");
    }
    
    (StatusCode::OK, "Stats received")
}

pub async fn start_webserver(app_handle: AppHandle) {
    let state = Arc::new(AppState { app_handle });
    
    let app = Router::new()
        .route("/ipc/postgame", post(handle_postgame))
        .layer(CorsLayer::permissive())
        .with_state(state);
    
    let listener = tokio::net::TcpListener::bind("127.0.0.1:7724")
        .await
        .expect("Failed to bind to port 7724");
    
    println!("Webserver listening on http://127.0.0.1:7724");
    
    axum::serve(listener, app)
        .await
        .expect("Failed to start webserver");
}