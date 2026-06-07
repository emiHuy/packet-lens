import styles from "./ProtocolBadge.module.css"

const colourClass = {
    TCP: styles.tcp,
    UDP: styles.udp,
    DNS: styles.dns,
    ICMP: styles.icmp,
}

export function ProtocolBadge({ protocol }) {
    const colour = colourClass[protocol] ?? styles.unknown;

    return (
        <span className={`${styles.badge} ${colour}`}>
            {protocol}
        </span>
    );
}