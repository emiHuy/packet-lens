const BASE_URL = "http://localhost:8000";

export async function startCapture(interfaceName = null, sessionName = null) {
    const params = new URLSearchParams();
    if (interfaceName) params.append("interface", interfaceName);
    if (sessionName) params.append("name", sessionName);

    const query = params.toString();
    const url = `${BASE_URL}/api/capture/start${query ? `?${query}` : ""}`;

    const res = await fetch(url, { method: "POST" });
    return res.json();
}

export async function stopCapture() {
    const res = await fetch(`${BASE_URL}/api/capture/stop`, { method: "POST" });
    return res.json();
}

export async function fetchSessions() {
    const res = await fetch(`${BASE_URL}/api/sessions`);
    return res.json();
}

export async function fetchSession(sessionId) {
    const res = await fetch(`${BASE_URL}/api/sessions/${sessionId}`);
    return res.json();
}

export async function renameSession(sessionId, name) {
    const res = await fetch(`${BASE_URL}/api/sessions/${sessionId}?name=${name}`, { method: "PATCH" });
    return res.json();
}

export async function deleteSession(sessionId) {
    const res = await fetch(`${BASE_URL}/api/sessions/${sessionId}`, { method: "DELETE" });
    return res.json();
}