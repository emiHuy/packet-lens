import { useState, useEffect, useRef, useCallback } from "react";

const WS_URL = "ws://localhost:8000/ws/packets";
const MAX_PACKETS = 200;

export function useWebSocket() {
    const [packets, setPackets] = useState([]);
    const [stats, setStats] = useState(null);
    const [connected, setConnected] = useState(false);

    const wsRef = useRef(null);
    const pendingRef = useRef({ packets: [], stats: null });
    const frameRef = useRef(null);

    const connect = useCallback(() => {
        // Prevent duplicate connections
        if (wsRef.current?.readyState == WebSocket.OPEN) return;

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
        };

        ws.onmessage = (event) => {
            const { packet, stats } = JSON.parse(event.data);

            pendingRef.current.packets.unshift(packet);
            pendingRef.current.stats = stats;

            // Batch updates every 100ms to prevent excessive re-renders under high packet volume
            if (!frameRef.current) {
                frameRef.current = setTimeout(() => {
                    // Keep the most recent MAX_PACKETS packets
                    setPackets((prev) => {
                        const next = [...pendingRef.current.packets, ...prev];
                        return next.length > MAX_PACKETS ? next.slice(0, MAX_PACKETS) : next;
                    });
                    setStats(pendingRef.current.stats);
                    pendingRef.current.packets = [];
                    frameRef.current = null;
                }, 100);
            }
        };

        ws.onclose = () => {
            setConnected(false);
        };

        ws.onerror = (err) => {
            console.error("[WS] Error:", err);
        };
    }, []);

    const disconnect = useCallback(() => {
        if (frameRef.current) clearTimeout(frameRef.current);
        wsRef.current?.close();
    }, [])

    // CLeanup connection on unmount
    useEffect(() => {
        return () => wsRef.current?.close();
    }, []);

    return { packets, stats, connected, connect, disconnect }
}