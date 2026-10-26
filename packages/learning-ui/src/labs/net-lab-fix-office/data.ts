import type { NetLabSpec } from "../types";

// Three independent faults (networking roadmap, lab 4.8): PC 1 has the wrong
// gateway, PC 2 has the wrong mask (so its default route cannot exist), and
// router 2 has no route back to the office.
export const netLabFixOffice: NetLabSpec = {
  slug: "net-lab-fix-office",
  family: "net",
  mode: "fault",
  title: "Fix the office network",
  purpose: "Two office PCs cannot reach the server two routers away. Find the three faults with real commands and fix them.",
  limits:
    "IPv4 only, one packet at a time, Linux behaviour (iproute2 output from Ubuntu 24.04). No DHCP, DNS or NAT in this lab, and times are made up but stable.",
  hints: [
    "Start on each PC with ip addr and ip route. Compare them with the router's address on the same switch.",
    "If PC 1 asks for a gateway nobody owns, ip neigh shows FAILED.",
    "A ping that leaves but never returns can be a missing route on the way back. Look at router 2's table.",
  ],
  startDevice: "pc1",
  tasks: [
    "Make PC 1 and PC 2 reach the server at 10.2.0.10.",
    "Make the server reach PC 1 (the reply path needs routes too).",
    "Fix the network with commands only: ip addr, ip route, ip link. Reset puts the faults back.",
  ],
  suggested: ["ip addr", "ip route", "ip neigh", "ping -c 2 10.2.0.10", "traceroute -n 10.2.0.10"],
  topology: {
    devices: [
      { id: "pc1", kind: "host", label: "PC 1", x: 80, y: 60, ifaces: [{ name: "eth0", addr: "10.1.0.10/24" }], routes: [{ dst: "default", via: "10.1.0.254" }] },
      { id: "pc2", kind: "host", label: "PC 2", x: 80, y: 280, ifaces: [{ name: "eth0", addr: "10.1.0.20/29" }] },
      { id: "sw", kind: "switch", label: "Office switch", x: 320, y: 170, ports: 4 },
      {
        id: "r1",
        kind: "router",
        label: "Router 1",
        x: 560,
        y: 170,
        ifaces: [
          { name: "lan", addr: "10.1.0.1/24" },
          { name: "wan", addr: "10.0.0.1/30" },
        ],
        routes: [{ dst: "10.2.0.0/24", via: "10.0.0.2" }],
      },
      {
        id: "r2",
        kind: "router",
        label: "Router 2",
        x: 820,
        y: 170,
        ifaces: [
          { name: "wan", addr: "10.0.0.2/30" },
          { name: "dc", addr: "10.2.0.1/24" },
        ],
      },
      {
        id: "server",
        kind: "host",
        label: "Server",
        x: 1080,
        y: 170,
        ifaces: [{ name: "eth0", addr: "10.2.0.10/24" }],
        routes: [{ dst: "default", via: "10.2.0.1" }],
        sockets: [{ proto: "tcp", addr: "0.0.0.0", port: 80, process: "nginx", reply: "<h1>Office intranet</h1>" }],
      },
    ],
    links: [
      { a: "pc1.eth0", b: "sw.p1" },
      { a: "pc2.eth0", b: "sw.p2" },
      { a: "r1.lan", b: "sw.p3" },
      { a: "r1.wan", b: "r2.wan" },
      { a: "r2.dc", b: "server.eth0" },
    ],
  },
  solution: {
    summary:
      "Three separate faults. PC 1 sends everything off the office network to 10.1.0.254, an address nobody owns, so its ARP question is never answered. PC 2 has a /29, which covers only 10.1.0.16 to 10.1.0.23, so the router at 10.1.0.1 is not on its network and the kernel will not accept it as a gateway. Router 2 knows nothing about 10.1.0.0/24, so every reply to the office is dropped there.",
    steps: [
      { device: "pc1", command: "ip route del default", why: "The default route points at 10.1.0.254. ip neigh shows it FAILED: no device answers for that address." },
      { device: "pc1", command: "ip route add default via 10.1.0.1", why: "10.1.0.1 is router 1's address on the office switch, so PC 1 can reach it directly." },
      { device: "pc2", command: "ip addr del 10.1.0.20/29 dev eth0", why: "A /29 holds 10.1.0.16 to 10.1.0.23. The router at 10.1.0.1 falls outside it, so PC 2 cannot use it." },
      { device: "pc2", command: "ip addr add 10.1.0.20/24 dev eth0", why: "The office network is a /24, the same mask PC 1 and router 1 use." },
      { device: "pc2", command: "ip route add default via 10.1.0.1", why: "Now 10.1.0.1 is on PC 2's network, so the kernel accepts it as the gateway." },
      { device: "r2", command: "ip route add 10.1.0.0/24 via 10.0.0.1", why: "Replies to the office must go back through router 1. Without this route router 2 answers the server with Destination Net Unreachable." },
    ],
  },
  checks: [
    { id: "pc1-server", label: "PC 1 reaches the server", from: "pc1", to: "10.2.0.10", kind: "ping", expect: "reach" },
    { id: "pc2-server", label: "PC 2 reaches the server", from: "pc2", to: "10.2.0.10", kind: "ping", expect: "reach" },
    { id: "server-pc1", label: "The server reaches PC 1", from: "server", to: "10.1.0.10", kind: "ping", expect: "reach" },
    { id: "pc1-web", label: "PC 1 opens the intranet page", from: "pc1", to: "10.2.0.10", kind: "tcp", port: 80, expect: "reach" },
  ],
};
