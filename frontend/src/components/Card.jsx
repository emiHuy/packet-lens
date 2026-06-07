import styles from "./Card.module.css"

export default function Card( { label, value, color } ) {
    return (
        <div className={styles.card}>
            <div className={styles.label}>{ label }</div>
            <div className={styles.value} style={{ color: color }}>
                { value || "--" }
            </div>
        </div>
    )
}