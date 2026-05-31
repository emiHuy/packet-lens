import { useEffect, useRef } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

import { PROTOCOL_COLOURS } from "../utils/constants";
import { formatNumber } from "../utils/helpers";
import styles from "./ChartBox.module.css"

export default function ChartBox({ type, title, data }) {
    return (
        <div className={styles.chartBox}>
            <div className={styles.title}>{ title }</div>
            {!data ? (
                <p>No data yet.</p>
            ) : type === "pie" ? (
                <PieChartView data={data}/>
            ) : (
                <BarChartView data={data}/>
            )}
        </div>
    )
}

function PieChartView({ data }) {
    const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));
    const total = chartData.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className={styles.pieChart}>
            <ResponsiveContainer width={140} height={140}>
                <PieChart>
                    <Pie data={chartData} cx={50} cy={65} innerRadius={32} outerRadius={50} dataKey="value" strokeWidth={0}>
                        {chartData.map((entry) => (
                            <Cell key={entry.name} fill={PROTOCOL_COLOURS[entry.name] ?? "var(--text-label)"} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>

            <div className={styles.legend}>
                {chartData.map((entry) => (
                    <div key={entry.name} className={styles.legendItem}>
                        <span className={styles.swatch} style={{ background: PROTOCOL_COLOURS[entry.name] ?? "#555566" }} />
                        <span>{entry.name}</span>
                        <span className={styles.legendVal}>{formatNumber(entry.value)} ({Math.round(entry.value / total * 100)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function BarChartView({ data }) {
    const chartData = Object.entries(data).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    
    const max = chartData[0]?.value ?? 1;
    const maxLabelLen = Math.max(...chartData.map(d => d.name.length));
    const maxLen = formatNumber(chartData[0]?.value)?.length ?? 1;

    return (
        <div className={styles.barChart}>
            {chartData.map((entry, i) => (
                <div key={entry.name} className={styles.row}>
                    <span className={styles.barLabel} style={{ minWidth: `${maxLabelLen}ch` }}>{entry.name}</span>
                    <div className={styles.barTrack}>
                        <div className={styles.bar} style={{width: `${Math.round((entry.value / max) * 100)}%`}}/>
                    </div>
                    <span className={styles.barValue} style={{ minWidth: `${maxLen}ch` }}>{formatNumber(entry.value)}</span>
                </div>
            ))}
        </div>
    );
}