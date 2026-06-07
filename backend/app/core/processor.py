from collections import Counter
import time

class PacketProcessor:
    def __init__(self, excluded_ips=None):
        # IPs to exclude from destination IPs
        self.excluded_ips = excluded_ips or set()

        # Master counters for current session
        self.total_packets = 0
        self.total_bytes = 0

        # Count frequencies of protocols, sources, destinations, and ports
        self.protocols = Counter()
        self.sources = Counter()
        self.destinations = Counter()
        self.ports = Counter()

        # Packets/seconds tracking
        self.packet_timestamps = []

        # Port mapping dictionary
        self.COMMON_PORTS = {
            20: "FTP Data", 
            21: "FTP", 22: 
            "SSH", 
            23: "Telnet",
            25: "SMTP", 
            53: "DNS", 
            67: "DHCP", 
            68: "DHCP",
            80: "HTTP", 
            110: "POP3", 
            143: "IMAP", 
            161: "SNMP",
            194: "IRC", 
            443: "HTTPS", 
            445: "SMB", 
            465: "SMTPS",
            587: "SMTP", 
            631: "IPP",
            993: "IMAPS", 
            995: "POP3S",
            1194: "OpenVPN", 
            1433: "MSSQL", 
            1521: "Oracle",
            3306: "MySQL", 
            3389: "RDP", 
            5432: "Postgres",
            5900: "VNC", 
            6379: "Redis", 
            8080: "HTTP-Alt",
            8443: "HTTPS-Alt", 
            27017: "MongoDB"
        }

    # Converts a port number into a consistent human-readable string label
    def _get_port_label(self, port) -> str:
        if port in self.COMMON_PORTS:
            return self.COMMON_PORTS[port]
        
        return "-" 
    
    def _get_pps(self) -> int:
        now = time.time()
        self.packet_timestamps.append(now)
        self.packet_timestamps = [t for t in self.packet_timestamps if now - t < 1.0]
        return len(self.packet_timestamps)
    
    # Take parsed packet, update session statistics, and enrich data with friendly names
    def process_packet_dict(self, parsed_packet: dict) -> dict:
        
        # Update session statistics
        self.total_packets += 1
        self.total_bytes += parsed_packet["size"]

        # Tally protocolos and IPs
        self.protocols[parsed_packet["protocol"]] += 1
        self.sources[parsed_packet["src"]] += 1
        dst = parsed_packet["dst"]

        includeDst = (
            dst not in self.excluded_ips
            and not dst.startswith("192.168.")
            and not dst.startswith("10.")
            and not dst.startswith("172.")
            and not dst.startswith("224.")
            and not dst.startswith("239.")
            and dst != "255.255.255.255"
        )

        if includeDst:
            self.destinations[dst] += 1

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
            "packets": self.total_packets,
            "bytes": self.total_bytes,
            "protocols": dict(self.protocols),
            "sources": dict(self.sources),
            "destinations": dict(self.destinations),
            "ports": dict(self.ports),
            "pps": self._get_pps(),
        }
