use std::sync::Arc;

use axum::{
    body::Body,
    extract::State,
    http::{header, StatusCode, Uri},
    response::{IntoResponse, Json, Response},
    routing::get,
    Router,
};
use rust_embed::RustEmbed;
use serde_json::Value;
use tokio::{net::TcpListener, sync::RwLock};
use tower_http::cors::CorsLayer;

// The on-device OBS overlay page. Built separately from the main app (pnpm build:overlay,
// see vite.overlay.config.ts) into ../dist-overlay, then baked into this binary at compile
// time so there's nothing extra to ship or locate at runtime across platforms. In debug
// builds rust-embed instead reads straight from that folder on disk, so `pnpm build:overlay`
// alone is enough to see changes without recompiling Rust.
#[derive(RustEmbed)]
#[folder = "../dist-overlay"]
struct OverlayAssets;

// Loopback-only local server that mirrors the live match data we already send to the
// cloud overlay, so OBS's Browser Source can hit it directly without a network round-trip.
pub type OverlayState = Arc<RwLock<Option<Value>>>;

pub const OVERLAY_PORT: u16 = 47822;

fn serve_embedded(path: &str) -> Response {
    match OverlayAssets::get(path) {
        Some(file) => {
            let mime = mime_guess::from_path(path).first_or_octet_stream();
            Response::builder()
                .header(header::CONTENT_TYPE, mime.as_ref())
                .body(Body::from(file.data.into_owned()))
                .unwrap()
        }
        None => StatusCode::NOT_FOUND.into_response(),
    }
}

async fn overlay_page() -> Response {
    serve_embedded("overlay.html")
}

// Catches everything else: Vite's own JS/CSS chunks under /assets/*, plus every image
// under /characters/*, /trainings/*, etc. that the build copied straight out of public/.
async fn serve_static(uri: Uri) -> Response {
    serve_embedded(uri.path().trim_start_matches('/'))
}

async fn get_state(State(state): State<OverlayState>) -> impl IntoResponse {
    match state.read().await.clone() {
        Some(value) => Json(value).into_response(),
        None => StatusCode::NO_CONTENT.into_response(),
    }
}

async fn health() -> &'static str {
    "ok"
}

#[tauri::command]
pub async fn update_overlay_state(
    state: tauri::State<'_, OverlayState>,
    payload: Value,
) -> Result<(), String> {
    *state.write().await = Some(payload);
    Ok(())
}

#[tauri::command]
pub fn get_overlay_port() -> u16 {
    OVERLAY_PORT
}

pub fn start(state: OverlayState) {
    tauri::async_runtime::spawn(async move {
        let app = Router::new()
            .route("/overlay", get(overlay_page))
            .route("/api/state", get(get_state))
            .route("/health", get(health))
            .fallback(serve_static)
            .layer(CorsLayer::permissive())
            .with_state(state);

        let addr = format!("127.0.0.1:{OVERLAY_PORT}");
        let listener = match TcpListener::bind(&addr).await {
            Ok(listener) => listener,
            Err(e) => {
                eprintln!("[overlay] failed to bind {addr}: {e}");
                return;
            }
        };

        println!("[overlay] listening on http://{addr}/overlay");
        if let Err(e) = axum::serve(listener, app).await {
            eprintln!("[overlay] server error: {e}");
        }
    });
}
