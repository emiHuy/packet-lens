import styles from "./Navbar.module.css"

export default function Navbar({ activeTab, switchTab, capturing }) {
    return  (
        <div className={styles.nav}>

            <div className={styles.brand}>
                <img className={styles.icon} src="/icon.svg"/>
                <div className={styles.title}>PacketLens</div>
            </div>

            <div className={styles.tabs}>
                <button className={`${styles.tab} ${activeTab=="Live" ? styles.active : ""}`} onClick={() => switchTab("Live")}>Live</button>
                <button className={`${styles.tab} ${activeTab=="Sessions" ? styles.active : ""}`} onClick={() => switchTab("Sessions")} disabled={capturing}>Sessions</button>
            </div>

        </div>
    )
}