# Mac LAN Media Controller

A lightweight, web-based remote controller for macOS, designed to be used over your local area network (LAN). Control your Mac's media playback and system volume from any device with a browser (phone, tablet, laptop).

## Features

*   **Media Control**: Play/Pause, Next Track, Previous Track (works with system media players like Music, Spotify, etc.).
*   **Volume Control**: 
    *   Adjust system volume (slider).
    *   Volume Up/Down buttons (fine-tuned 5% steps).
    *   Toggle Mute.
*   **Real-time Status**: The UI updates to reflect the current volume and mute state of the Mac.
*   **Mobile-Friendly Interface**: Responsive design using React and Lucide icons.

## Tech Stack

*   **Frontend**: React (Vite), TypeScript.
*   **Backend**: Rust (Actix-web).
*   **System Integration**: AppleScript (`osascript`) for volume control, Swift for media key events.

## Prerequisites

*   **macOS**: This application is designed specifically for macOS.
*   **Node.js & npm**: For building the frontend.
*   **Rust & Cargo**: For building and running the backend server.
*   **Swift**: Included with Xcode Command Line Tools (usually pre-installed on macOS) to compile the media controller helper.

## Installation & Setup

### 1. Build the Frontend

The frontend needs to be built into static files that the backend will serve.

```bash
# Install dependencies
npm install

# Build the project (outputs to ./dist)
npm run build
```

### 2. Setup the Backend

Navigate to the backend directory:

```bash
cd backend
```

**Compile the Swift Helper:**
The Rust backend uses a small Swift utility to simulate media key presses.

```bash
swiftc MediaController.swift -o media
```

**Build and Run the Server:**

```bash
cargo run
```

The server will start at `http://0.0.0.0:8080`.

## Usage

1.  Ensure your Mac and the controlling device (e.g., iPhone) are on the **same Wi-Fi/LAN network**.
2.  Find your Mac's local IP address (System Settings -> Wi-Fi -> Details... -> IP Address, e.g., `192.168.1.5`).
3.  On your phone, open a browser and visit: `http://<YOUR_MAC_IP>:8080` (e.g., `http://192.168.1.5:8080`).
4.  You should see the control interface.

## API Endpoints

The backend exposes the following REST API:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/toggle` | Play/Pause media |
| `GET` | `/api/next` | Next track |
| `GET` | `/api/prev` | Previous track |
| `GET` | `/api/volume/up` | Increase volume by 5% |
| `GET` | `/api/volume/down` | Decrease volume by 5% |
| `GET` | `/api/volume/{level}` | Set volume to specific level (0-100) |
| `GET` | `/api/mute/toggle` | Toggle mute |
| `GET` | `/api/status` | Get current volume and mute status |

## Development

*   **Frontend Dev**: Run `npm run dev` to start the Vite dev server (usually port 5173). Note that this won't connect to the real backend unless you configure a proxy or CORS, or run the backend locally.
*   **Backend Dev**: Run `cargo run` in the `backend/` directory.

## Notes

*   **Permissions**: When you first run the app, macOS might ask for permission to allow the terminal/app to control "System Events" or "Music". You must **Allow** this for the controls to work.