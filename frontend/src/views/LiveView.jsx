import { Play, Square } from "lucide-react";
import styles from "./LiveView.module.css"

export default function LiveView({ capturing, setCapturing, session }) {
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

                </div>
            }
            
            
        </div>
    )
}