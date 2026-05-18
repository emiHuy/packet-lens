# PacketLens Backend
FastAPI backend that captures and streams live network packets over WebSocket.

## Stack
- FastAPI + Uvicorn
- Scapy (packet capture)
- WebSockets
- psutil (interface detection)

## Setup
> **Note:** Requires Npcap on Windows and administrator privileges.

1. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

2. Run the app:
    ```bash
    uvicorn app.main:app --reload
    ```

## API
| Method | Endpoint | Params | Description |
|--------|----------|:------:|-------------|
| POST | `/api/capture/start` | `interface` (optional), `name` (optional) | Start capture |  
| POST | `/api/capture/stop` | — | Stop capture |  
| GET | `/api/sessions` | — | Get all sessions |  
| GET | `/api/sessions/{session_id}` | — | Get session by ID |  
| PATCH | `/api/sessions/{session_id}` | `name` | Rename session |  
| WS | `/ws/packets` | — | Stream packets + session stats | 