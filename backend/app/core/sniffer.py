from scapy.all import sniff, IP, TCP, UDP, ICMP, ARP
import threading
import time

class PacketSniffer:
    def __init__(self):
        self.running = False
        self.thread = None
        self.interface = None
        self.on_packet_captured = None # external callback function

    # Parse raw packets into a clean dictionary
    def _process_packet(self, packet):

        if not self.on_packet_captured:
            return
        
        # Only process Network (IP) or Link Layer (ARP) packets
        if not (packet.haslayer(IP) or packet.haslayer(ARP)):
            return
        
        # Initialize default packet structure
        parsed = {
            "id": f"{packet.time}-{len(packet)}",
            "timestamp": packet.time,
            "size": len(packet),
            "protocol": "UNKNOWN",
            "src": "Unknown",
            "dst": "Unknown",
            "sport": "-",
            "dport": "-",
            "summary": packet.summary()
        }

        # Parse IPv4 traffic
        if packet.haslayer(IP):
            parsed["src"] = packet[IP].src
            parsed["dst"] = packet[IP].dst

            if packet.haslayer(TCP):
                parsed["protocol"] = "TCP"
                parsed["sport"] = int(packet[TCP].sport)
                parsed["dport"] = int(packet[TCP].dport)
            elif packet.haslayer(UDP):
                parsed["protocol"] = "UDP"
                parsed["sport"] = int(packet[UDP].sport)
                parsed["dport"] = int(packet[UDP].dport)
            elif packet.haslayer(ICMP):
                parsed["protocol"] = "ICMP"

        # Parse ARP traffic
        elif packet.haslayer(ARP):
            parsed["protocol"] = "ARP"
            parsed["src"] = packet[ARP].psrc
            parsed["dst"] = packet[ARP].pdst

        # Send parsed dictionary to the external application layer
        self.on_packet_captured(parsed)

    # Worker thread loop executing Scapy's sniff function
    def _sniff_loop(self):
        try: 
            sniff(
                iface=self.interface,
                prn=self._process_packet,
                stop_filter=lambda p: not self.running, # break loop instantly when self.running = false
                store=False
            )
        except Exception as e:
            print(f"[-] Error in sniffer loop: {e}")
        finally:
            self.running = False
    
    # Starts the sniffer loop in a background daemon thread
    def start(self, interface=None, callback=None):
        if self.running:
            print("[!] Sniffer already running")
            return
        
        print("[*] Starting sniffer...")
        self.running = True
        self.interface = interface
        self.on_packet_captured = callback

        # daemon=True ensures the thread dies if the main process crashes
        self.thread = threading.Thread(target=self._sniff_loop, daemon=True)
        self.thread.start()

    # Signals the sniffer thread to stop and wait for it to join
    def stop(self):
        if not self.running:
            print("[!] Sniffer not running")
            return
        
        print("[*] Stopping sniffer...")
        self.running = False # Triggers the stop_filter condition

        # Wait up to 2 seconds for the thread to wrap up
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=2.0)
            self.thread = None

        print("[*] Sniffer stopped")