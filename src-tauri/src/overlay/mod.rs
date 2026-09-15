use std::sync::Arc;

use axum::{
    extract::State,
    http::StatusCode,
    response::{Html, IntoResponse, Json},
    routing::get,
    Router,
};
use serde_json::Value;
use tokio::{net::TcpListener, sync::RwLock};
use tower_http::cors::CorsLayer;

// Loopback-only local server that mirrors the live match data we already send to the
// cloud overlay, so OBS's Browser Source can hit it directly without a network round-trip.
pub type OverlayState = Arc<RwLock<Option<Value>>>;

pub const OVERLAY_PORT: u16 = 47822;

// Bare-bones test page so the pipeline (bridge event -> Rust state -> HTTP) can be
// verified in a real browser / OBS before any real overlay UI is built.
const TEST_PAGE: &str = r#"<!doctype html>
<html>
<head><meta charset="utf-8"><title>Ai.Mi Overlay (dev)</title></head>
<body style="background:transparent;color:#eee;font:14px monospace;margin:0;padding:12px;">
<pre id="state">waiting for match data...</pre>
<script>
async function poll() {
  try {
    const res = await fetch('/api/state');
    document.getElementById('state').textContent =
      res.status === 204 ? 'no match data yet' : JSON.stringify(await res.json(), null, 2);
  } catch (e) {
    document.getElementById('state').textContent = 'error: ' + e;
  }
  setTimeout(poll, 1000);
}
poll();
</script>
</body>
</html>"#;

async fn overlay_page() -> Html<&'static str> {
    Html(TEST_PAGE)
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
            .layer(CorsLayer::permissive())
            .with_state(state);

        let addr = format!("127.0.0.1:{OVERLAY_PORT}");
        let listener = match TcpListener::bind(&addr).await {
            Ok(listener) => listener,
            Err(e) => {
                eprintln!("[overlay_server] failed to bind {addr}: {e}");
                return;
            }
        };

        println!("[overlay_server] listening on http://{addr}/overlay");
        if let Err(e) = axum::serve(listener, app).await {
            eprintln!("[overlay_server] server error: {e}");
        }
    });
}
