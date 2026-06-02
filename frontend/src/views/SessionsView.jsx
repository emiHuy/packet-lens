import { useState, useEffect } from "react"

import { fetchSessions } from "../api/client";
import { formatNumber, formatBytes, formatSessionMeta } from "../utils/helpers";

import styles from "./SessionsView.module.css"

export default function SessionsView() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const data = await fetchSessions();
            setSessions(data);
            setLoading(false);
        }
        load();
    }, []);

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
                            <div className={styles.sessionName}>{session.name}</div>
                            <div className={styles.sessionMeta}>{formatSessionMeta(session)}</div>
                        </div>
                        <div className={styles.right}>
                            <div className={styles.sessionNumbers}>
                                <div className={styles.sessionPackets}>{formatNumber(session.total_packets)} pkts</div>
                                <div className={styles.sessionBytes}>{formatBytes(session.total_bytes)}</div>
                            </div>
                            <div className={styles.options}>
                                <button className={styles.emoji}>✏️</button>
                                <button className={styles.emoji}>🗑️</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}