
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

export function formatSessionMeta(session) {
    const date = new Date(session.started_at * 1000); // if unix timestamp

    const day = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    return `${day} · ${time}`;
}