import { useState } from "react";
import styles from "./Navbar.module.css"

export default function Navbar() {
    const [activeTab, setActiveTab] = useState("Live"); // Options: "Live" or "Sessions"

    return  (
        <div className={styles.nav}>

            <div className={styles.brand}>
                <img className={styles.icon} src="/icon.svg"/>
                <div className={styles.title}>PacketLens</div>
            </div>

            <div className={styles.tabs}>
                <button className={`${styles.tab} ${activeTab=="Live" ? styles.active : ""}`} onClick={() => setActiveTab("Live")}>Live</button>
                <button className={`${styles.tab} ${activeTab=="Sessions" ? styles.active : ""}`} onClick={() => setActiveTab("Sessions")}>Sessions</button>
            </div>

        </div>
    )
}