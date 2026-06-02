import sqlite3
import threading
import time
import json

from app.db.models import CREATE_SESSIONS_TABLE, CREATE_PACKETS_TABLE

DB_PATH = "packetlens.db"
JSON_FIELDS = ["protocols", "sources", "destinations", "ports"]

class SessionManager:
    def __init__(self):
        self._lock = threading.Lock()
        self._init_db()

    def _get_conn(self):
        return sqlite3.connect(DB_PATH, check_same_thread=False)
    
    # Create tables if they don't exist
    def _init_db(self):
        with self._lock:
            conn = self._get_conn()
            cursor = conn.cursor()
            cursor.execute(CREATE_SESSIONS_TABLE)
            cursor.execute(CREATE_PACKETS_TABLE)
            conn.commit()
            conn.close()
    
    # Convert JSON columns back into dictionaries on read
    def _deserialize_session(self, row: dict) -> dict:
        for field in JSON_FIELDS:
            if row.get(field):
                row[field] = json.loads(row[field]) 
            else:
                row[field] = {}
        return row
    
    # Create capture session and store in database
    def create_session(self, interface: str, name: str = None) -> int:
        with self._lock:
            conn = self._get_conn()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO sessions (started_at, interface) VALUES (?, ?)",
                (time.time(), interface)
            )
            session_id = cursor.lastrowid

            # Set the session name with the provided name, or auto-generated name if none provided
            resolved_name = name or f"Session {session_id}"
            cursor.execute(
                "UPDATE sessions SET name = ? WHERE id = ?",
                (resolved_name, session_id)
            )

            conn.commit()
            conn.close()
            return session_id
        
    # End capture session and store the final stats snapshot
    def end_session(self, session_id: int, stats: dict):
        with self._lock:
            conn = self._get_conn()
            cursor = conn.cursor()
            cursor.execute(
                """UPDATE sessions
                   SET ended_at = ?, total_packets = ?, total_bytes = ?,
                       protocols = ?, sources = ?, destinations = ?, ports = ?
                   WHERE id = ?""",
                (
                    time.time(),
                    stats["packets"],
                    stats["bytes"],
                    json.dumps(stats["protocols"]),
                    json.dumps(stats["sources"]),
                    json.dumps(stats["destinations"]),
                    json.dumps(stats["ports"]),
                    session_id,
                )
            )
            conn.commit()
            conn.close()

    # Store captured packet in database
    def insert_packet(self, session_id: int, packet: dict):
        with self._lock:
            conn = self._get_conn()
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO packets
                   (session_id, timestamp, size, protocol, src, dst, sport, dport, sport_friendly, dport_friendly, summary) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    session_id,
                    packet.get("timestamp"),
                    packet.get("size"),
                    packet.get("protocol"),
                    packet.get("src"),
                    packet.get("dst"),
                    str(packet.get("sport", "-")),
                    str(packet.get("dport", "-")),
                    packet.get("sport_friendly", "-"),
                    packet.get("dport_friendly", "-"),
                    packet.get("summary"),
                )
            )
            conn.commit()
            conn.close()

    # Rename existing session
    def rename_session(self, session_id: int, name: str) -> bool:
        with self._lock:
            conn = self._get_conn()
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE sessions SET name = ? WHERE id = ?",
                (name, session_id)
            )
            updated = cursor.rowcount > 0
            conn.commit()
            conn.close()

            return updated # returns False if provided session id doesn't exist
        
    # Delete session by id
    def delete_session(self, session_id: int) -> bool :
        with self._lock:
            conn = self._get_conn()
            cursor = conn.cursor()
            cursor.execute(
                "DELETE FROM sessions WHERE id = ?",
                (session_id,)
            )
            conn.commit()
            return cursor.rowcount > 0

    # Get all sessions from database
    def get_all_sessions(self) -> list:
        with self._lock:
            conn = self._get_conn()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM sessions ORDER BY started_at DESC")

            sessions = []
            for row in cursor.fetchall():
                sessions.append(self._deserialize_session(dict(row)))

            conn.close()
            return sessions
        
    # Get session and its packet data from database using provided session id
    def get_session_by_id(self, session_id: int) -> dict | None:
        with self._lock:
            conn = self._get_conn()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            # Get session from sessions table
            cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
            session = cursor.fetchone()
            if not session:
                conn.close()
                return None

            # Get packets from packets table
            cursor.execute(
                "SELECT * FROM packets WHERE session_id = ? ORDER BY timestamp ASC",
                (session_id,)
            )
            packets = []
            for row in cursor.fetchall():
                packets.append(dict(row))
            conn.close()

            return {
                **self._deserialize_session(dict(session)), 
                "packets": packets,
            }