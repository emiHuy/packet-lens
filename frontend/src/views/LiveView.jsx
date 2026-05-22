import { Play, Square } from "lucide-react";

import Card from "../components/Card"
import styles from "./LiveView.module.css"

export default function LiveView({ capturing, setCapturing, session, stats }) {
    return (
        <div className={styles.liveView}>

            {!capturing && 
                <div className={styles.idleWrapper}>
                    
                    <div className={styles.startBtnWrapper}>
                        <div className={styles.ring}></div>
                        <button className={styles.startBtn} id="start-capture-btn">
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
                        <button className={styles.stopBtn}>
                            <Square size={15} color="var(--red)" fill="var(--red)" strokeWidth={1}></Square>
                            Stop capture
                        </button>
                        <span className={styles.sessionInfo}>{session?.interface || "Unknown" } · {session.session_name || session?.session_id || "Unnamed Session"}</span>
                    </div>

                    <div className={styles.cards}>
                        <Card label="Total Packets" value={stats?.packets} color="var(--text-accented)"></Card>
                        <Card label="Total Bytes" value={stats?.bytes} color="var(--text-accented)"></Card>
                        <Card label="Top Protocol" value={Object.entries(stats?.ports || {}).sort((a,b) => b[1]-a[1])[0]} color="var(--text-accented)"></Card> {/* Change colour based on protocol shown */}
                        <Card label="Packets/second" value={stats?.pps} color="var(--text-accented)"></Card>
                    </div>

                </div>
            }
            
            
        </div>
    )
}