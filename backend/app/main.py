"""
FastAPI application entry point. Manages the packet capture pipeline,
WebSocket broadcasting, and session lifecycle via REST endpoints.
"""

import asyncio
from contextlib import asynccontextmanager

import socket
import psutil
from scapy.all import IFACES

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.core.sniffer import PacketSniffer
from app.core.processor import PacketProcessor
from app.db.session_store import SessionManager

packet_queue: asyncio.Queue = None 
active_websockets: list[WebSocket] = []
current_session_id: int = None

# Handles background tasks starting up and shutting down cleanly
@asynccontextmanager
async def lifespan(app: FastAPI):
    global packet_queue
    packet_queue = asyncio.Queue()
    app.state.loop = asyncio.get_running_loop()

    worker_task = asyncio.create_task(broadcast_worker())
    print("[*] Broadcast worker started successfully.")

    yield # application runs while yield is active

    # Clean up when server shuts down
    worker_task.cancel()
    print("[*] Broadcast worker shut down.")

# Initialize FastAPI with lifespan manager
app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sniffer = PacketSniffer()
processor = None
session_manager = SessionManager()

# Asynchronous background task that continuously pulls data from the queue and broadcasts it to all active WebSocket connections
async def broadcast_worker():
    while True:
        try:
            if packet_queue is None:
                await asyncio.sleep(0.1)
                continue

            payload = await packet_queue.get()

            for websocket in list(active_websockets):
                try:
                    await websocket.send_json(payload)
                except:
                    if websocket in active_websockets:
                        active_websockets.remove(websocket)
                
            packet_queue.task_done()

        except Exception as e:
            print("[-] CRITICAL ERROR IN BROADCAST WORKER:")
            await asyncio.sleep(1)  # Prevent an infinite rapid crash loop

# Process captured packets and add them to the queue
def network_pipeline_callback(parsed_packet):
    global processor
    if processor:
        enriched_packet = processor.process_packet_dict(parsed_packet)
        stats_snapshot = processor.get_session_stats()

        if current_session_id is not None:
            session_manager.insert_packet(current_session_id, enriched_packet)

        payload = {
            "packet": enriched_packet,
            "stats": stats_snapshot,
        }

        loop = app.state.loop
        loop.call_soon_threadsafe(packet_queue.put_nowait, payload)

def get_local_ips():
    excluded = {"127.0.0.1", "255.255.255.255"}
    for iface, addrs in psutil.net_if_addrs().items():
        for addr in addrs:
            if addr.family == socket.AF_INET:
                excluded.add(addr.address)
    return excluded

# Find the machine's default interface
def get_default_interface():
    # Get interface stats
    stats = psutil.net_if_stats()
    
    skip_keywords = ["loopback", "virtual", "miniport", "bluetooth", "wi-fi direct", "virtualbox"]
    
    for guid, iface in IFACES.items():
        desc = iface.description.lower()
        name = iface.name.lower()
        
        # Skip virtual/irrelevant interfaces
        if any(k in desc for k in skip_keywords):
            continue
        
        # Check if interface is active via psutil
        for psutil_name, stat in stats.items():
            if stat.isup and (psutil_name.lower() in desc or psutil_name.lower() in name):
                return iface.name  # return the NPF GUID name
    
    return None

# --- Capture ---

# Signal PacketSniffer to start the capture
@app.post("/api/capture/start")
def start_capture(interface: str = None, name: str = None):
    global processor, sniffer, current_session_id

    if sniffer.running:
        return {"status": "error", "message": "Capture already in progress"}
    
    selected_interface = interface or get_default_interface()

    if not selected_interface:
        return {"status": "error", "message": "No suitable interface found"}

    processor = PacketProcessor(excluded_ips=get_local_ips())
    current_session_id = session_manager.create_session(selected_interface, name)
    sniffer.start(interface=selected_interface, callback=network_pipeline_callback)

    return {"status": "started", "interface": selected_interface, "session_id": current_session_id}

# Signal PacketSniffer to stop capture
@app.post("/api/capture/stop")
def stop_capture():
    global processor, sniffer, current_session_id

    if not sniffer.running:
        return {"status": "error", "message": "No active capture session to stop"}
    
    sniffer.stop()

    if current_session_id is not None and processor is not None:
        session_manager.end_session(current_session_id, processor.get_session_stats())
    session_id = current_session_id
    current_session_id = None

    return {"status": "stopped", "session_id": session_id}

# --- Sessions ---

# Get all sessions
@app.get("/api/sessions")
def get_sessions():
    return session_manager.get_all_sessions()

# Get session from session id
@app.get("/api/sessions/{session_id}")
def get_session_by_id(session_id: int):
    session = session_manager.get_session_by_id(session_id)
    if not session:
        return {"status": "error", "message": f"Session {session_id} not found"}
    return session

# Change existing session's name
@app.patch("/api/sessions/{session_id}")
def rename_session(session_id: int, name: str):
    updated = session_manager.rename_session(session_id, name)
    if not updated:
        return {"status": "error", "message": f"Session {session_id} not found"}
    return {"status": "ok", "session_id": session_id, "name": name}

# Delete session by id
@app.delete("/api/sessions/{session_id}")
def delete_session(session_id: int):
    deleted = session_manager.delete_session(session_id)
    if not deleted:
        return {"status": "error", "message": f"Session {session_id} not found"}
    return {"status": "ok"}

# --- WebSocket ---

# Accepts and tracks live WebSocket connections from the frontend
@app.websocket("/ws/packets")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_websockets.append(websocket)
    print(f"[*] Client connected. Total clients: {len(active_websockets)}")

    try: 
        while True:
            # Keep the connection alive and listen for incoming messages from client
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in active_websockets:
            active_websockets.remove(websocket)
        print(f"[-] Client disconnected. Remaining clients: {len(active_websockets)}")

        if len(active_websockets) == 0 and sniffer.running:
            print("[*] No active clients left. Auto-stopping the packet sniffer.")
            sniffer.stop()