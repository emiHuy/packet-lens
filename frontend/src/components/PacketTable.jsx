import { memo } from "react"

import { ProtocolBadge } from "./ProtocolBadge"
import { formatNumber, formatTimestamp, formatBytes } from "../utils/helpers"

import styles from "./PacketTable.module.css"

export default function PacketTable( { packets = [] } ) {
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
                    {packets.length > 0 ? ( packets.map((p, index) => (
                        <PacketRow key={`${p.id}-${index}`} packet={p}/>
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
        <td>{formatTimestamp(packet.timestamp)}</td>
        <td><ProtocolBadge protocol={packet.protocol}/></td>
        <td>{packet.src}</td>
        <td>{packet.dst}</td>
        <td>{packet.sport_friendly}</td>
        <td>{packet.dport_friendly}</td>
        <td>{formatBytes(packet.size)}</td>
    </tr>
));

