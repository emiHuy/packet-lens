CREATE_SESSIONS_TABLE = """
    CREATE TABLE IF NOT EXISTS sessions (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        name          TEXT,
        started_at    REAL NOT NULL,
        ended_at      REAL,
        interface     TEXT,
        packets       INTEGER DEFAULT 0,
        bytes         INTEGER DEFAULT 0,
        protocols     TEXT,
        sources       TEXT,
        destinations  TEXT,
        ports         TEXT,
        pps           REAL
    );
"""

CREATE_PACKETS_TABLE = """
    CREATE TABLE IF NOT EXISTS packets (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id       INTEGER NOT NULL,
        timestamp        REAL,
        size             INTEGER,
        protocol         TEXT,
        src              TEXT,
        dst              TEXT,
        sport            TEXT,
        dport            TEXT,
        sport_friendly   TEXT,
        dport_friendly   TEXT,
        summary          TEXT,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
    );
"""