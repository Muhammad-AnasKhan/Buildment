import type { NetLabSpec } from "../types";

// A working network to explore: a laptop and a phone on a switch, two
// routers, and a web server. Every command prints from the model.
export const netExploreOffice: NetLabSpec = {
  slug: "net-explore-office",
  family: "net",
  mode: "explore",
  title: "Explore a small network",
  purpose: "Run real commands on any device, then step through the packet they sent, one hop at a time.",
  limits:
    "IPv4 only, one packet at a time, Linux behaviour (iproute2 output from Ubuntu 24.04). No DHCP, DNS or NAT yet, and times are made up but stable.",
  hints: ["Ping the phone from the laptop, then look at ip neigh on both.", "traceroute -n 203.0.113.80 names each router on the way."],
  startDevice: "laptop",
  suggested: ["ip addr", "ip route", "ping -c 2 192.168.1.24", "traceroute -n 203.0.113.80", "ss -tlnp", "curl http://203.0.113.80/"],
  topology: {
    devices: [
      {
        id: "laptop",
        kind: "host",
        label: "Laptop",
        x: 80,
        y: 60,
        ifaces: [{ name: "eth0", addr: "192.168.1.23/24" }],
        routes: [{ dst: "default", via: "192.168.1.1", metric: 100 }],
        sockets: [
          { proto: "tcp", addr: "127.0.0.1", port: 8000, process: "python3", reply: "dev server on loopback" },
          { proto: "tcp", addr: "0.0.0.0", port: 8001, process: "python3", reply: "dev server on every address" },
        ],
      },
      { id: "phone", kind: "host", label: "Phone", x: 80, y: 280, ifaces: [{ name: "wlan0", addr: "192.168.1.24/24" }], routes: [{ dst: "default", via: "192.168.1.1", metric: 600 }] },
      { id: "sw", kind: "switch", label: "Switch", x: 320, y: 170, ports: 4 },
      {
        id: "r1",
        kind: "router",
        label: "Router 1",
        x: 560,
        y: 170,
        ifaces: [
          { name: "lan", addr: "192.168.1.1/24" },
          { name: "wan", addr: "198.51.100.2/30" },
        ],
        routes: [{ dst: "default", via: "198.51.100.1" }],
      },
      {
        id: "r2",
        kind: "router",
        label: "Router 2",
        x: 820,
        y: 170,
        ifaces: [
          { name: "home", addr: "198.51.100.1/30" },
          { name: "dc", addr: "203.0.113.1/24" },
        ],
        routes: [{ dst: "192.168.1.0/24", via: "198.51.100.2" }],
      },
      {
        id: "server",
        kind: "host",
        label: "Web server",
        x: 1080,
        y: 170,
        ifaces: [{ name: "eth0", addr: "203.0.113.80/24" }],
        routes: [{ dst: "default", via: "203.0.113.1" }],
        sockets: [{ proto: "tcp", addr: "0.0.0.0", port: 80, process: "nginx", reply: "<h1>It works</h1>" }],
      },
    ],
    links: [
      { a: "laptop.eth0", b: "sw.p1" },
      { a: "phone.wlan0", b: "sw.p2" },
      { a: "r1.lan", b: "sw.p3" },
      { a: "r1.wan", b: "r2.home" },
      { a: "r2.dc", b: "server.eth0" },
    ],
  },
};
