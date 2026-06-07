import Card from "../components/Card"
import ChartBox from "../components/ChartBox"
import PacketTable from "../components/PacketTable"

import { formatNumber, formatBytes } from "../utils/helpers"
import styles from "./Dashboard.module.css"

export default function Dashboard({ stats, packets }) {

    const top5 = (obj) => Object.fromEntries(Object.entries(obj || {}).slice(0, 5));

    return (
        <div className={styles.dashboard}>
            <div className={styles.cards}>
                <Card label="Total Packets" value={formatNumber(stats?.packets)} color="var(--text-accented)"></Card>
                <Card label="Total Bytes" value={formatBytes(stats?.bytes)} color="var(--text-accented)"></Card>
                <Card label="Top Protocol" value={Object.entries(stats?.protocols || {}).sort((a,b) => b[1]-a[1])[0]?.[0]} color="var(--text-accented)"></Card> {/* Change colour based on protocol shown */}
                <Card label="Packets/second" value={formatNumber(stats?.pps)} color="var(--text-accented)"></Card>
            </div>

            <div className={styles.charts}>
                <ChartBox type="pie" title="Protocol Breakdown" data={top5(stats?.protocols)}/>
                <ChartBox type="bar" title="Top Ports" data={top5(stats?.ports)}/>
                <ChartBox type="bar" title="Top Destinations" data={top5(stats?.destinations)}/>
            </div>

            <div className={styles.packetTable}>
                <PacketTable packets={packets}/>
            </div>
        </div>
    )
}