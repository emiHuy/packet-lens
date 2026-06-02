import { useState, useEffect } from "react"

import { fetchSessions, renameSession, deleteSession } from "../api/client";
import { formatNumber, formatBytes, formatSessionMeta } from "../utils/helpers";

import styles from "./SessionsView.module.css"

export default function SessionsView() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState("");

    useEffect(() => {
        async function load() {
            const data = await fetchSessions();
            setSessions(data);
            setLoading(false);
        }
        load();
    }, []);

    async function handleRename(id) {
        try {
            await renameSession(id, editingName);
            setSessions(sessions.map(s => s.id === id ? { ...s, name: editingName } : s));
        } finally {
            setEditingId(null);
        }
    }

    async function handleDelete(id) {
        try {
            await deleteSession(id);
            setSessions(sessions.filter(s => s.id !== id));
        } catch (e) {
            console.error("Failed to delete session", e);
        }
    }

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.sessionsView}>
            <div className={styles.header}>
                <span className={styles.title}>Saved Sessions</span>
                <span className={styles.count}>{sessions.length} sessions</span>
            </div>
            <div className={styles.list}>
                {sessions.map((session) => (
                    <div key={session.id} className={styles.row}>
                        <div className={styles.sessionInfo}>
                            <div className={styles.sessionName}>
                                {editingId === session.id ? (
                                    <input
                                        className={styles.renameInput}
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        onBlur={() => handleRename(session.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleRename(session.id);
                                            if (e.key === "Escape") setEditingId(null);
                                        }}
                                        autoFocus
                                    />
                                ) : (
                                    session.name
                                )}
                            </div>
                            <div className={styles.sessionMeta}>{formatSessionMeta(session)}</div>
                        </div>
                        <div className={styles.right}>
                            <div className={styles.sessionNumbers}>
                                <div className={styles.sessionPackets}>{formatNumber(session.total_packets)} pkts</div>
                                <div className={styles.sessionBytes}>{formatBytes(session.total_bytes)}</div>
                            </div>
                            <div className={styles.options}>
                                <button className={styles.emoji} onClick={() => { setEditingId(session.id); setEditingName(session.name); }}>✏️</button>
                                <button className={styles.emoji} onClick={() => { handleDelete(session.id)}}>🗑️</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}