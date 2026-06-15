# Football Live - Live Streaming Platform

A complete live streaming website built with React, TailwindCSS, and Node.js. Stream football matches live using OBS Studio.

## Quick Start

### Prerequisites
- Node.js (v18+)
- npm
- FFmpeg (for RTMP to HLS transcoding)

### Install FFmpeg
```bash
winget install Gyan.FFmpeg
```
> Restart your terminal after installing FFmpeg.

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start the Application

**Option A: Use the startup script (recommended)**
```powershell
.\start.ps1
```

**Option B: Start manually**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. Access the Application
- **Website:** http://localhost:5173
- **Dashboard:** http://localhost:5173/dashboard

## OBS Studio Setup

1. Open OBS Studio
2. Go to **Settings > Stream**
3. Set **Service** to `Custom`
4. Set **Server** to `rtmp://localhost:1935/live`
5. Go to http://localhost:5173/dashboard
6. Click **Generate Stream Key**
7. Copy the stream key and paste it in OBS **Stream Key** field
8. Click **Start Streaming** in OBS
9. Your stream will be live on the website!

## Architecture

```
OBS Studio --RTMP--> Node Media Server (port 1935)
                         |
                    FFmpeg transcodes
                         |
                    HLS segments (.m3u8)
                         |
React App <--HLS------- Express API (port 3001)
                              |
                        WebSocket (real-time status)
```

### Ports
| Service | Port | Description |
|---------|------|-------------|
| Frontend | 5173 | React dev server |
| API | 3001 | Express backend |
| RTMP | 1935 | RTMP ingest server |
| Media | 8888 | HLS media server |

## Features

- Stream key generation and management
- RTMP ingest with authentication
- RTMP to HLS transcoding via FFmpeg
- HLS player with hls.js
- Real-time stream status via WebSocket
- Viewer count tracking
- Responsive TailwindCSS design

## Project Structure

```
Football Live/
├── backend/
│   ├── server.js          # Express + RTMP server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── VideoPlayer.jsx
│   │   │   ├── StreamKeyManager.jsx
│   │   │   └── StreamStatus.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Watch.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   └── package.json
├── media/                  # HLS output directory
├── start.ps1              # Startup script
└── README.md
```
