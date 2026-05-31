
export function formatNumber(num) {
    return num?.toLocaleString() || num;
}

export function formatTimestamp(timestamp) {
    const [seconds, fractions] = timestamp.toFixed(6).split(".");
    const date = new Date(parseInt(seconds) * 1000);
    const baseIso = date.toISOString().split(".")[0];
    return `${baseIso}.${fractions}Z`;
}