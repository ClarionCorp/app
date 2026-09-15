use std::convert::Infallible;

use axum::{
    body::Body,
    extract::State,
    http::{header, StatusCode, Uri},
    response::{
        sse::{Event, KeepAlive, Sse},
        IntoResponse, Json, Response,
    },
    routing::get,
    Router,
};
use futures_util::stream::{Stream, StreamExt};
use rust_embed::RustEmbed;
use serde_json::Value;
use tokio::{net::TcpListener, sync::watch};
use tokio_stream::wrappers::WatchStream;
use tower_http::cors::CorsLayer;


// This is the on-device OBS overlay page built separately from the main app.
// Changes only show up via running `pnpm build:overlay` again btw.
// Auto compiles when running `pnpm build:windows` or `pnpm build:linux`.
#[derive(RustEmbed)]
#[folder = "../dist-overlay"]
struct OverlayAssets;

type Channel = watch::Sender<Option<Value>>;

fn new_channel() -> Channel {
    watch::channel(None).0
}

// This is a loopback-only local webserver that forwards match data between the app and vite.
// This is so we don't have to do a network roundtrip or NAT forwarding or whatever lol.
#[derive(Clone)]
pub struct OverlayState {
    pub match_state: Channel,
    pub queue_state: Channel,
}

impl OverlayState {
    pub fn new() -> Self {
        Self {
            match_state: new_channel(),
            queue_state: new_channel(),
        }
    }
}

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

async fn queue_page() -> Response {
    serve_embedded("queue.html")
}

// Catches everything else: Vite's own JS/CSS chunks under /assets/*, plus every image
// under /characters/*, /trainings/*, etc. that the build copied straight out of public/.
async fn serve_static(uri: Uri) -> Response {
    serve_embedded(uri.path().trim_start_matches('/'))
}

fn channel_response(channel: &Channel) -> Response {
    match channel.borrow().clone() {
        Some(value) => Json(value).into_response(),
        None => StatusCode::NO_CONTENT.into_response(),
    }
}

// Pushes the current snapshot immediately on connect.
// (watch::Receiver always starts with the latest value, even if it was sent before this client subscribed)
// Then again every time update_overlay_state sends a new one. The overlay page just listens.
fn channel_stream(channel: &Channel) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let stream = WatchStream::new(channel.subscribe()).map(|value| {
        Ok(Event::default()
            .json_data(&value)
            .unwrap_or_else(|_| Event::default().data("null")))
    });
    Sse::new(stream).keep_alive(KeepAlive::default())
}

async fn get_match_state(State(state): State<OverlayState>) -> Response {
    channel_response(&state.match_state)
}

async fn stream_match_state(
    State(state): State<OverlayState>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    channel_stream(&state.match_state)
}

async fn get_queue_state(State(state): State<OverlayState>) -> Response {
    channel_response(&state.queue_state)
}

async fn stream_queue_state(
    State(state): State<OverlayState>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    channel_stream(&state.queue_state)
}

async fn health() -> &'static str {
    "ok"
}

#[tauri::command]
pub fn update_overlay_state(state: tauri::State<'_, OverlayState>, payload: Value) {
    // Errs only when nobody is currently subscribed (e.g. OBS isn't open yet) - the
    // channel still keeps the value, so the next subscriber gets it immediately anyway.
    let _ = state.match_state.send(Some(payload));
}

#[tauri::command]
pub fn update_queue_state(state: tauri::State<'_, OverlayState>, payload: Value) {
    let _ = state.queue_state.send(Some(payload));
}

#[tauri::command]
pub fn get_overlay_port() -> u16 {
    OVERLAY_PORT
}

pub fn start(state: OverlayState) {
    tauri::async_runtime::spawn(async move {
        let app = Router::new()
            .route("/overlay", get(overlay_page))
            .route("/queue", get(queue_page))
            .route("/api/state", get(get_match_state))
            .route("/api/state/stream", get(stream_match_state))
            .route("/api/queue", get(get_queue_state))
            .route("/api/queue/stream", get(stream_queue_state))
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

        println!("[Overlay] Listening on http://{addr} (Game: /overlay, Queue: /queue)");
        if let Err(e) = axum::serve(listener, app).await {
            eprintln!("[Overlay] Server error: {e}");
        }
    });
}
