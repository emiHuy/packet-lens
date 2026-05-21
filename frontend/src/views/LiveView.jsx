import { Play, Square } from "lucide-react";
import styles from "./LiveView.module.css"

export default function LiveView({ capturing, setCapturing }) {
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
        </div>
    )
}