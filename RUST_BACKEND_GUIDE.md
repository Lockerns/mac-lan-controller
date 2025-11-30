# Rust Backend Setup Guide

Since you are running this project locally to control your Mac, you need to compile and run the Rust backend service.

## 1. Prerequisites
- Install Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- Ensure your `.media` Swift executable is in the same folder as the project or accessible via path.

## 2. Initialize Rust Project

Create a folder named `backend` and run:
```bash
cd backend
cargo init
```

## 3. Configure `Cargo.toml`

Add the following dependencies to your `backend/Cargo.toml`:

```toml
[package]
name = "mac_media_server"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.7"
tokio = { version = "1.0", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tower-http = { version = "0.5", features = ["cors"] }
```

## 4. The Code

Copy the content from `backend/main.rs` provided in this project into your `backend/src/main.rs` file.

## 5. Running the Server

1. Place your compiled `controller.media` (rename it to `media` or update the Rust code to match your filename) in the root of the backend folder.
2. Run:
   ```bash
   cargo run
   ```
3. The server will start on `0.0.0.0:8080`.

## 6. Connect Frontend
In `constants.ts` of the frontend, set `IS_DEMO_MODE = false` and ensure `API_BASE_URL` matches your computer's local IP address (e.g., `http://192.168.1.50:8080`) if accessing from a phone.
