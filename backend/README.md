# PacketLens Backend
FastAPI backend that captures and streams live network packets over WebSocket.

## Stack
- FastAPI + Uvicorn
- Scapy (packet capture)
- WebSockets

## Setup
> **Note:** Requires Npcap on Windows and administrator privileges.

1. Install dependencies:
    ```bash
    pip install fastapi uvicorn websockets scapy psutil
    ```

2. Run the app:
    ```bash
    uvicorn app.main:app --reload
    ```

## API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/capture/start` | Start capture, auto-detects interface |
| POST | `/api/capture/stop` | Stop capture |
| WS | `/ws/packets` | Stream packets + session stats |