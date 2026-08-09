# Netre VMS — Smart Video Management System

> A modern, AI-powered Video Management System for real-time surveillance, intrusion detection, and intelligent event management.

Netre is built to give security operators a unified interface for monitoring live camera feeds, reviewing historical recordings, and navigating AI-detected events through an interactive timeline — all from a single screen.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Netre VMS Architecture                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    HTTP/REST     ┌──────────────────────────────┐ │
│  │              │ ◄──────────────► │       FastAPI Backend        │ │
│  │   React +    │                  │                              │ │
│  │  TypeScript  │    MJPEG/MP4     │  ┌────────────────────────┐  │ │
│  │   Frontend   │ ◄──────────────► │  │   Stream Router        │  │ │
│  │              │                  │  │   (Live MJPEG + VOD)   │  │ │
│  │  ┌────────┐  │                  │  └────────────────────────┘  │ │
│  │  │Dashboard│  │                  │  ┌────────────────────────┐  │ │
│  │  │Live View│  │                  │  │   Camera/Zone/Event    │  │ │
│  │  │Playback │  │                  │  │   CRUD APIs            │  │ │
│  │  │Events   │  │                  │  └────────────────────────┘  │ │
│  │  │Zone Edit│  │                  │  ┌────────────────────────┐  │ │
│  │  └────────┘  │                  │  │   AI Background Worker │  │ │
│  └──────────────┘                  │  │   (YOLOv8 / Mock)      │  │ │
│                                    │  └───────────┬────────────┘  │ │
│                                    │              │               │ │
│                                    │  ┌───────────▼────────────┐  │ │
│                                    │  │   SQLite Database      │  │ │
│                                    │  │   cameras │ zones      │  │ │
│                                    │  │   events  │ recordings │  │ │
│                                    │  └────────────────────────┘  │ │
│                                    └──────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Detect Pipeline (Tier-0)                   │   │
│  │  Frame Source → Motion Gate → YOLOv8 ONNX → Tracker → Events│   │
│  │  ┌──────┐  ┌───────┐  ┌──────────┐  ┌───────┐  ┌────────┐  │   │
│  │  │FFmpeg│→ │Motion │→ │Region    │→ │YOLO   │→ │Multi-  │  │   │
│  │  │Decode│  │Detect │  │Crop+NMS  │  │Detect │  │Tracker │  │   │
│  │  └──────┘  └───────┘  └──────────┘  └───────┘  └────────┘  │   │
│  │                                                              │   │
│  │  Zone Filter → Gate (Tier-1 Dispatch) → Event Bus (NATS)     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────┐                                           │
│  │   IP Cameras / RTSP  │  Video feeds via RTSP/HTTP/USB            │
│  │   Phone Cameras      │                                           │
│  │   Test Video Files   │                                           │
│  └──────────────────────┘                                           │
└─────────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript, Vite, React Router, HLS.js, WebRTC |
| Backend | Python 3.10+, FastAPI, SQLAlchemy, Uvicorn |
| Database | SQLite (file-based, zero config) |
| AI Detection | YOLOv8 (ONNX Runtime) with OpenCV, mock fallback |
| Streaming | MJPEG (live), MP4/HLS VOD (playback) |
| Detection Pipeline | Custom Tier-0 pipeline: Motion gating → Region cropping → YOLO inference → Multi-object tracking |

## Features

### Live Monitoring
- Multi-camera grid view with real-time MJPEG streams
- Per-camera controls: rotate, zoom in/out, fullscreen
- Live alert pulse badges on cameras with recent detections
- Single-camera expanded view with one click

### AI-Powered Detection
- YOLOv8 object detection (person, car, dog, bicycle, etc.)
- Configurable detection zones drawn directly on camera feeds
- Zone-based event filtering — only triggers for selected areas
- Motion-gated inference — saves compute by skipping static frames

### Interactive Playback
- Timeline-based video scrubbing with event markers
- Click any event marker to jump to that exact moment
- Playback speed control (0.5×, 1×, 2×, 4×)
- Camera selector for reviewing different feeds

### Event Management
- Full event log with camera, zone, label, confidence, and timestamp
- Filter events by camera, detection label, or date range
- Natural language search ("find person near front door")
- Jump-to-playback from any event

### Dashboard
- Camera status overview (online/offline)
- Real-time AI detection count and active alerts
- Storage usage monitoring
- System health indicators

### Zone Editor
- Draw polygon detection zones directly on the camera feed
- Name and manage multiple zones per camera
- AI only triggers events inside defined zones
- Visual zone overlay on live feeds

## Database Schema

```
┌──────────────┐       ┌──────────────┐
│   cameras    │       │    zones     │
├──────────────┤       ├──────────────┤
│ id (PK)      │◄──┐   │ id (PK)      │
│ name         │   │   │ camera_id(FK)│───►cameras.id
│ source_type  │   │   │ name         │
│ stream_url   │   │   │polygon_points│ (JSON array of [x,y])
│ file_path    │   │   │ created_at   │
│ status       │   │   └──────────────┘
│ created_at   │   │
└──────────────┘   │   ┌──────────────┐
                   │   │   events     │
                   │   ├──────────────┤
                   ├───│ camera_id(FK)│
                   │   │ zone_id (FK) │───►zones.id
                   │   │ label        │ (person, car, dog...)
                   │   │ confidence   │ (0.0 - 1.0)
                   │   │ caption      │ (human-readable description)
                   │   │thumbnail_path│
                   │   │ occurred_at  │
                   │   └──────────────┘
                   │
                   │   ┌──────────────┐
                   │   │  recordings  │
                   │   ├──────────────┤
                   └───│ camera_id(FK)│
                       │ file_path    │
                       │ start_time   │
                       │ end_time     │
                       │ created_at   │
                       └──────────────┘
```

## Setup Instructions

### Prerequisites
- Python 3.10 or higher
- Node.js 18+ and npm
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-team/Netre.git
cd Netre
```

### 2. Backend Setup
```bash
cd server
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The backend starts at `http://localhost:8000`. Verify with:
```bash
curl http://localhost:8000/
# Response: {"status":"ok","service":"Netre VMS"}
```

### 3. Seed Demo Data (First Run)
```bash
curl -X POST http://localhost:8000/api/v1/cameras/seed-demo
```
This creates 4 sample cameras, detection zones, and 30+ AI events for demonstration.

### 4. Frontend Setup
```bash
cd app
npm install
npm run dev
```
The frontend starts at `http://localhost:5173`.

### 5. (Optional) AI Detection with Real YOLOv8
To use real AI detection instead of the mock:
1. Download `yolov8n.onnx` from [Ultralytics](https://github.com/ultralytics/assets/releases)
2. Place it at `detect-pipeline/models/yolov8n.onnx`
3. Restart the backend — the AI worker will pick it up automatically

### 6. (Optional) Test with Phone Camera
Use an IP camera app (like "IP Webcam" on Android) to stream your phone's camera via HTTP. Then add the camera:
```bash
curl -X POST http://localhost:8000/api/v1/cameras/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Phone Camera","stream_url":"http://192.168.1.5:8080/video","source_type":"live"}'
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cameras/` | List all cameras |
| POST | `/api/v1/cameras/` | Add a new camera |
| GET | `/api/v1/cameras/{id}` | Get camera details |
| PATCH | `/api/v1/cameras/{id}` | Update camera (status, name, etc.) |
| DELETE | `/api/v1/cameras/{id}` | Remove a camera |
| GET | `/api/v1/cameras/{id}/zones` | List zones for a camera |
| POST | `/api/v1/cameras/{id}/zones` | Create a detection zone |
| DELETE | `/api/v1/cameras/{id}/zones/{zone_id}` | Delete a zone |
| POST | `/api/v1/cameras/seed-demo` | Populate demo data |
| GET | `/api/v1/events/` | List events (filterable) |
| GET | `/api/v1/events/recent-alerts` | Events from last 1 hour |
| GET | `/api/v1/events/stats-summary` | Dashboard statistics |
| GET | `/api/v1/events/system-stats` | Storage and recording stats |
| POST | `/api/v1/events/search` | Natural language event search |
| GET | `/api/v1/streams/live/{camera_id}` | Live MJPEG stream |
| GET | `/api/v1/streams/playback/{recording_id}` | MP4 playback |
| GET | `/api/v1/recordings/` | List recordings |

## How to Record a Demo Video

1. **Start both servers** (backend + frontend)
2. **Seed demo data** — click the "Seed Demo Data" button on the Dashboard
3. **Walk through each feature:**
   - **Dashboard**: Show KPI cards, camera status grid, AI search, active alerts
   - **Live View**: Show camera grid, click to expand one camera, show alert badges
   - **Zone Editor**: Click "Draw Zones" on a camera, draw a polygon zone, save it
   - **Playback**: Select a camera, scrub the timeline, click event markers
   - **Events**: Show the full event log, filter by label, click Play to jump to playback
   - **NLP Search**: Type "find person" or "show me cars" in the AI Search bar
4. **Show the architecture**: Briefly show the terminal running the backend + frontend

## Project Structure

```
Netre/
├── app/                          # React Frontend
│   ├── src/
│   │   ├── views/                # Page-level components
│   │   │   ├── Dashboard.tsx     # System overview + KPIs
│   │   │   ├── LiveView.tsx      # Multi-camera live grid
│   │   │   ├── PlaybackView.tsx  # Timeline-based video review
│   │   │   └── EventsView.tsx    # Full event log with filters
│   │   ├── components/           # Reusable UI components
│   │   │   ├── VideoPlayer/      # WebRTC/HLS/MP4 player
│   │   │   ├── ZoneEditor.tsx    # Polygon zone drawing
│   │   │   ├── PlaybackConsole.tsx
│   │   │   ├── PlaybackTimeline.tsx
│   │   │   └── FeedSidebar.tsx   # Real-time event feed
│   │   ├── services/             # API client modules
│   │   ├── shell/                # App layout shell
│   │   └── lib/                  # Utilities + API helpers
│   ├── package.json
│   └── vite.config.ts
├── server/                       # FastAPI Backend
│   ├── main.py                   # App entry + CORS + lifespan
│   ├── models.py                 # SQLAlchemy ORM models
│   ├── schemas.py                # Pydantic validation schemas
│   ├── core/database.py          # SQLite + session factory
│   ├── routers/                  # API endpoint handlers
│   │   ├── cameras.py            # Camera + Zone CRUD
│   │   ├── events.py             # Event queries + NLP search
│   │   ├── recordings.py         # Recording queries
│   │   └── streams.py            # MJPEG + MP4 streaming
│   ├── services/
│   │   └── ai_worker.py          # Background AI inference loop
│   └── requirements.txt
└── detect-pipeline/              # Tier-0 AI Detection Engine
    └── detect_pipeline/
        ├── pipeline.py           # Core: Motion → Crop → YOLO → Track
        ├── onnx_detector.py      # YOLOv8 ONNX inference
        ├── motion.py             # Background subtraction
        ├── tracking.py           # Multi-object tracker
        ├── zone_filter.py        # Polygon zone containment
        ├── gate.py               # Tier-1 dispatch decisions
        └── service.py            # Worker thread management
```

## Third-Party Acknowledgments

| Library | License | Usage |
|---------|---------|-------|
| React | MIT | UI framework |
| FastAPI | MIT | Backend API framework |
| SQLAlchemy | MIT | ORM / database |
| OpenCV | Apache 2.0 | Video capture + image processing |
| YOLOv8 (Ultralytics) | AGPL-3.0 | Object detection model |
| ONNX Runtime | MIT | Model inference engine |
| HLS.js | Apache 2.0 | HTTP Live Streaming in browser |
| Heroicons | MIT | UI icons |
| Lucide React | ISC | Additional UI icons |
| Vite | MIT | Frontend build tool |

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

---

<!-- Screenshots and test output will be added after testing -->
