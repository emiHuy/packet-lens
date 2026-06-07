import { Play, Square } from "lucide-react"
import { useState, useEffect } from "react"

import { startCapture, stopCapture } from "../api/client"
import { useWebSocket } from "../hooks/useWebSocket"

import Dashboard from "../components/Dashboard"
import styles from "./LiveView.module.css"

export default function LiveView({ capturing, setCapturing }) {
    const [session, setSession] = useState({});
    const { packets, stats, connected, connect, disconnect } = useWebSocket();

    async function handleStart() {
        const res = await startCapture();
        if (res.status === "started") {
            connect();
            setCapturing(true);
            setSession({ "sessionId": res.session_id, "interface": res.interface });
        }
    }

    async function handleStop() {
        const res = await stopCapture();
        if (res.status === "stopped") {
            disconnect();
            setCapturing(false);
        }
    }

    useEffect(() => {
        async function handleTabClose() {
            if (!capturing) return;
            await stopCapture();
            disconnect();
        }
        window.addEventListener("beforeunload", handleTabClose);
        window.addEventListener("pagehide", handleTabClose);
        return () => {
            window.removeEventListener("beforeunload", handleTabClose);
            window.removeEventListener("pagehide", handleTabClose);
        };
    }, [capturing]);

    return (
        <div className={styles.liveView}>

            {!capturing && 
                <div className={styles.idleWrapper}>
                    
                    <div className={styles.startBtnWrapper}>
                        <div className={styles.ring}></div>
                        <button className={styles.startBtn} onClick={handleStart}>
                            <Play size={30} color="var(--text-accented-muted)" fill="var(--text-accented-muted)" stroke="var(--text-accented)" strokeWidth={1.5}/>
                        </button>
                    </div>

                    <div className={styles.startText}>
                        <p className={styles.secondaryText}>No active capture</p>
                        <p className={styles.tertiaryText}>press start to begin monitoring</p>
                    </div>

                </div>
            }

            {capturing &&
                <div className={styles.activeWrapper}>

                    <div className={styles.topbar}>
                        <button className={styles.stopBtn} onClick={handleStop}>
                            <Square size={15} color="var(--red)" fill="var(--red)" strokeWidth={1}></Square>
                            Stop capture
                        </button>
                        <span className={styles.sessionInfo}>{session?.interface || "Unknown" } · {session.session_name || session?.session_id || "Unnamed Session"}</span>
                    </div>

                    <Dashboard stats={stats} packets={packets}/>

                </div>
            }
        </div>
    )
}