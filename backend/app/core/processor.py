from collections import Counter

class PacketProcessor:
    def __init__(self):
        # Master counters for current session
        self.total_packets = 0
        self.total_bytes = 0

        # Count frequencies of protocols, sources, destinations, and ports
        self.protocols = Counter()
        self.sources = Counter()
        self.destinations = Counter()
        self.ports = Counter()

        # Port mapping dictionary
        self.COMMON_PORTS = {
            80: "HTTP",
            443: "HTTPS",
            53: "DNS",
            22: "SSH",
            8000: "FastAPI App"
        }

    # Converts a port number into a consistent human-readable string label
    def _get_port_label(self, port) -> str:
        if port == "-":
            return "-"
    
        if port in self.COMMON_PORTS:
            return self.COMMON_PORTS[port]
        
        return f"Port {port}"
    
    # Take parsed packet, update session statistics, and enrich data with friendly names
    def process_packet_dict(self, parsed_packet: dict) -> dict:
        
        # Update session statistics
        self.total_packets += 1
        self.total_bytes += parsed_packet["size"]

        # Tally protocolos and IPs
        self.protocols[parsed_packet["protocol"]] += 1
        self.sources[parsed_packet["src"]] += 1
        self.destinations[parsed_packet["dst"]] += 1

        # Enrich and tally ports
        parsed_packet["sport_friendly"] = self._get_port_label(parsed_packet["sport"])
        parsed_packet["dport_friendly"] = self._get_port_label(parsed_packet["dport"])

        # Tally destination ports for our "Top Services" dashboard chart
        if parsed_packet["dport_friendly"] != "-":
            self.ports[parsed_packet["dport_friendly"]] += 1

        return parsed_packet
    
    # Returns the aggregated data snapshot for the frontend
    def get_session_stats(self) -> dict:
        return {
            "total_packets": self.total_packets,
            "total_bytes": self.total_bytes,
            "protocols": dict(self.protocols),
            "sources": dict(self.sources),
            "destinations": dict(self.destinations),
            "ports": dict(self.ports)
        }
