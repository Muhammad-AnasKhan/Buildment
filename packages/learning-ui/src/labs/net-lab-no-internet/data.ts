import type { NetLabSpec } from "../types";

// Chapter 7.5: "connected, but no internet". Three faults at three different
// layers, found by walking up from the cable: the router's DHCP service is off
// (so the laptop has no address), the lease it will hand out names a resolver
// nobody runs, and the router has no default route to its provider. The command
// output follows the course's recorded dhcp-dns and capstone sessions.
export const netLabNoInternet: NetLabSpec = {
  slug: "net-lab-no-internet",
  family: "net",
  mode: "fault",
  title: "Connected, but no internet",
  purpose:
    "A laptop is plugged into the home network and cannot load a page. Walk up the layers from the cable to the web page, find the three faults, and fix each one where it lives.",
  limits:
    "IPv4 only, one packet at a time, Linux behaviour (iproute2, dig and udhcpc output from Ubuntu 24.04). One DHCP server and one DNS server on the router. Times are made up but stable.",
  hints: [
    "Go in order: ip link (cable), ip addr (address), ping the gateway, ping 203.0.113.80 (route out), dig web.test (name), curl (page). The first step that fails is the layer to fix.",
    "No address after udhcpc usually means nobody answered. Ask the router what its DHCP service is doing: systemctl status dnsmasq.",
    "dig @192.168.1.1 web.test asks one server directly. If that works and plain dig web.test does not, the laptop is asking the wrong server: cat /etc/resolv.conf.",
    "A ping to the outside that gets Destination Net Unreachable from your own gateway means the gateway has no route onward. Check ip route on the router.",
  ],
  startDevice: "laptop",
  tasks: [
    "Give the laptop an address from the router's DHCP service.",
    "Make the laptop reach the outside server at 203.0.113.80.",
    "Make the name web.test resolve, and the page at http://web.test:8080/ load.",
    "Fix it with commands only. Reset puts the faults back.",
  ],
  suggested: ["ip link", "ip addr", "udhcpc -i eth0", "ping -c 2 192.168.1.1", "ping -c 2 203.0.113.80", "cat /etc/resolv.conf", "dig web.test", "curl http://web.test:8080/"],
  topology: {
    devices: [
      { id: "laptop", kind: "host", label: "Laptop", x: 80, y: 200, ifaces: [{ name: "eth0" }] },
      { id: "sw", kind: "switch", label: "Home switch", x: 320, y: 200, ports: 4 },
      {
        id: "router",
        kind: "router",
        label: "Home router",
        x: 560,
        y: 200,
        ifaces: [
          { name: "lan", addr: "192.168.1.1/24" },
          { name: "wan", addr: "198.51.100.2/30" },
        ],
        nat: { masquerade: ["wan"] },
        // No default route: the router knows its two networks and nothing beyond.
        dnsmasq: {
          // The DHCP service is stopped.
          running: false,
          // The lease tells clients to ask 192.168.1.53, where no DNS server runs.
          dhcp: { iface: "lan", start: "192.168.1.100", end: "192.168.1.150", lease: 3600, dns: "192.168.1.53" },
          dns: { iface: "lan", records: { "web.test": "203.0.113.80" } },
        },
      },
      {
        id: "isp",
        kind: "router",
        label: "Provider router",
        x: 820,
        y: 200,
        ifaces: [
          { name: "home", addr: "198.51.100.1/30" },
          { name: "out", addr: "203.0.113.1/24" },
        ],
      },
      {
        id: "server",
        kind: "host",
        label: "Web server",
        x: 1080,
        y: 200,
        ifaces: [{ name: "eth0", addr: "203.0.113.80/24" }],
        routes: [{ dst: "default", via: "203.0.113.1" }],
        sockets: [{ proto: "tcp", addr: "0.0.0.0", port: 8080, process: "busybox", reply: "the server sees you as {client}" }],
      },
    ],
    links: [
      { a: "laptop.eth0", b: "sw.p1" },
      { a: "router.lan", b: "sw.p2" },
      { a: "router.wan", b: "isp.home" },
      { a: "isp.out", b: "server.eth0" },
    ],
  },
  solution: {
    summary:
      "Three faults, one per layer. The router's dnsmasq was stopped, so nothing answered the laptop's DHCP discover and it stayed without an address. Once it had a lease, the lease named 192.168.1.53 as the DNS server, an address nobody owns, so every name lookup timed out; the router itself answers DNS at 192.168.1.1. And the router had no default route, so it answered anything beyond its own networks with Destination Net Unreachable.",
    steps: [
      {
        device: "router",
        command: "systemctl start dnsmasq",
        why: "systemctl status dnsmasq shows inactive (dead). dnsmasq is both the DHCP server and the DNS server, so while it is stopped the laptop gets no lease and nobody answers names.",
      },
      {
        device: "laptop",
        command: "udhcpc -i eth0",
        why: "Now the discover is answered. The lease gives the laptop an address from the pool, the router as its gateway, and a DNS server (which is wrong; the next steps find that).",
      },
      {
        device: "router",
        command: "ip route add default via 198.51.100.1",
        why: "The router could reach its two networks and nothing else, so a ping to 203.0.113.80 came back Destination Net Unreachable from 192.168.1.1. Its provider's side of the link, 198.51.100.1, is the way out.",
      },
      {
        device: "laptop",
        command: 'echo "nameserver 192.168.1.1" > /etc/resolv.conf',
        why: "dig web.test timed out because the laptop asked 192.168.1.53. dig @192.168.1.1 web.test works, so the resolver file should name the router.",
      },
    ],
  },
  checks: [
    { id: "link", label: "Link: the laptop's cable is plugged in and up", from: "laptop", to: "eth0", kind: "link", expect: "reach" },
    { id: "address", label: "Address: the laptop has one from the router's DHCP service", from: "laptop", to: "eth0", kind: "address", within: "192.168.1.0/24", leased: true, expect: "reach" },
    { id: "gateway", label: "Gateway: the laptop reaches its router, 192.168.1.1", from: "laptop", to: "192.168.1.1", kind: "ping", expect: "reach" },
    { id: "route-out", label: "Route out: the laptop reaches 203.0.113.80", from: "laptop", to: "203.0.113.80", kind: "ping", expect: "reach" },
    { id: "name", label: "Name: web.test resolves", from: "laptop", to: "web.test", kind: "dns", expect: "reach" },
    { id: "page", label: "Page: http://web.test:8080/ loads", from: "laptop", to: "web.test", kind: "tcp", port: 8080, expect: "reach" },
  ],
};
