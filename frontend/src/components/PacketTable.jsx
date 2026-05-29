import { memo } from "react"
import styles from "./PacketTable.module.css"

export default function PacketTable( { packets } ) {
    return (
        <div className={styles.tableWrapper}>
            <table>
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Protocol</th>
                        <th>Src IP</th>
                        <th>Dst IP</th>
                        <th>Src Port</th>
                        <th>Dst Port</th>
                        <th>Size</th>
                    </tr>     
                </thead>
                <tbody>
                    {packets.length > 0 ? ( packets.map((p) => (
                        <PacketRow key={p.id} packet={p}/>
                    ))) : (
                        <tr>
                            <td className={styles.empty} colSpan={7}>No data yet.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

const PacketRow = memo(({ packet }) => (
    <tr>
        <td>{packet.timestamp}</td> {/* format timestamp using helper */}
        <td>{packet.protocol}</td> {/* Use protocol badge */}
        <td>{packet.src}</td>
        <td>{packet.dst}</td>
        <td>{packet.sport_friendly}</td>
        <td>{packet.dport_friendly}</td>
        <td>{packet.size}</td> {/* format bytes */}
    </tr>
));

