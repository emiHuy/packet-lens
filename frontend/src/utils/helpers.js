
export function formatNumber(num) {
    return num?.toLocaleString() || num;
}

export function formatTimestamp(timestamp) {
    const [seconds, fractions] = timestamp.toFixed(6).split(".");
    const date = new Date(parseInt(seconds) * 1000);
    const baseIso = date.toISOString().split(".")[0];
    return `${baseIso}.${fractions}Z`;
}

export function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}