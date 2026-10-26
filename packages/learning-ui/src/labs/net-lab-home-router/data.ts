import type { NetLabSpec } from "../types";

// Chapter 6.9: a home router with three faults, modelled on the course's home
// router challenge (masquerade, port forward, guest isolation). Forwarding is
// off, the port forward points at an address nobody owns, and the guest network
// is not cut off from the home network. The rule and the ruleset text come from
// the recorded forward-guest and capstone sessions.
export const netLabHomeRouter: NetLabSpec = {
  slug: "net-lab-home-router",
  family: "net",
  mode: "fault",
  title: "Reach the home server from outside",
  purpose:
    "A home router shares one public address with every device behind it. Make the laptop reach the outside server, let the outside server reach the home web page through a forwarded port, and keep the guest network away from the home devices.",
  limits:
    "IPv4 only, one packet at a time, Linux behaviour (nftables, conntrack and iproute2 output from Ubuntu 24.04). Connections stay in the conntrack table; nothing times out. Port numbers on a clash are chosen by a fixed rule, not at random.",
  hints: [
    "Start on the router: sysctl net.ipv4.ip_forward and nft -a list ruleset. A router that does not forward drops everything that is not for itself.",
    "From the outside server, curl http://203.0.113.1:8080/ hangs when the port-forward rule points at an address nobody owns. Compare its target with the home web server's address (ip addr on the web server).",
    "The filter table has a forward chain with no rules in it. A rule there needs the guest block as the source and the home block as the destination, then drop.",
    "conntrack -L on the router lists each translated connection: the first set of addresses is what the device sent, the second is what the answer will look like.",
  ],
  startDevice: "hrouter",
  tasks: [
    "Make the laptop reach the outside server at 203.0.113.80 port 8080, and make the server see the router's address, 203.0.113.1, not the laptop's.",
    "Make the outside server reach the home web server through 203.0.113.1:8080.",
    "Make the guest unable to reach the home web server, while it can still reach the outside server.",
    "Fix the router with commands only: sysctl, nft. Reset puts the faults back.",
  ],
  suggested: [
    "sysctl net.ipv4.ip_forward",
    "nft -a list ruleset",
    "conntrack -L",
    "ip addr",
    "curl http://203.0.113.80:8080/",
    "curl http://203.0.113.1:8080/",
    "curl http://192.168.1.20/",
  ],
  topology: {
    devices: [
      {
        id: "laptop",
        kind: "host",
        label: "Laptop",
        x: 80,
        y: 60,
        ifaces: [{ name: "eth0", addr: "192.168.1.23/24" }],
        routes: [{ dst: "default", via: "192.168.1.1" }],
      },
      {
        id: "phone",
        kind: "host",
        label: "Phone",
        x: 80,
        y: 200,
        ifaces: [{ name: "wlan0", addr: "192.168.1.24/24" }],
        routes: [{ dst: "default", via: "192.168.1.1" }],
      },
      {
        id: "homeweb",
        kind: "host",
        label: "Home web server",
        x: 80,
        y: 340,
        ifaces: [{ name: "eth0", addr: "192.168.1.20/24" }],
        routes: [{ dst: "default", via: "192.168.1.1" }],
        sockets: [{ proto: "tcp", addr: "0.0.0.0", port: 80, process: "busybox", reply: "home web server" }],
      },
      { id: "sw", kind: "switch", label: "Home switch", x: 320, y: 200, ports: 4 },
      {
        id: "hrouter",
        kind: "router",
        label: "Home router",
        x: 580,
        y: 200,
        forwarding: false,
        ifaces: [
          { name: "lan", addr: "192.168.1.1/24" },
          { name: "guest", addr: "192.168.50.1/24" },
          { name: "wan", addr: "203.0.113.1/24" },
        ],
        nat: {
          masquerade: ["wan"],
          // The home web server is 192.168.1.20, not .21.
          dnat: [{ in: "wan", proto: "tcp", port: 8080, to: "192.168.1.21:80" }],
        },
        // The forward chain exists and has no rules: the guest can reach the home network.
        filter: [],
      },
      {
        id: "guest",
        kind: "host",
        label: "Guest phone",
        x: 580,
        y: 380,
        ifaces: [{ name: "wlan0", addr: "192.168.50.30/24" }],
        routes: [{ dst: "default", via: "192.168.50.1" }],
      },
      {
        id: "server",
        kind: "host",
        label: "Outside server",
        x: 860,
        y: 200,
        ifaces: [{ name: "eth0", addr: "203.0.113.80/24" }],
        sockets: [{ proto: "tcp", addr: "0.0.0.0", port: 8080, process: "busybox", reply: "the server sees you as {client}" }],
      },
    ],
    links: [
      { a: "laptop.eth0", b: "sw.p1" },
      { a: "phone.wlan0", b: "sw.p2" },
      { a: "homeweb.eth0", b: "sw.p3" },
      { a: "hrouter.lan", b: "sw.p4" },
      { a: "hrouter.guest", b: "guest.wlan0" },
      { a: "hrouter.wan", b: "server.eth0" },
    ],
  },
  solution: {
    summary:
      "Three separate faults. The router had forwarding off, so it answered only for itself and dropped everything it was asked to pass on. The port-forward rule sent outside traffic to 192.168.1.21, an address nobody owns, so the router's ARP question went unanswered and the connection hung; the web server is 192.168.1.20. And the forward chain was empty, so the guest could reach the home network: one drop rule from the guest block to the home block closes that without touching the guest's way out.",
    steps: [
      {
        device: "hrouter",
        command: "sysctl -w net.ipv4.ip_forward=1",
        why: "A Linux router passes packets on only when net.ipv4.ip_forward is 1. With 0 it drops everything that is not addressed to itself, so neither the laptop nor the forwarded port worked.",
      },
      {
        device: "hrouter",
        command: 'nft replace rule ip nat prerouting handle 4 iifname "wan" tcp dport 8080 dnat to 192.168.1.20:80',
        why: "nft -a list ruleset shows the port-forward rule as handle 4. It sent port 8080 to 192.168.1.21, where nobody lives. The web server is 192.168.1.20, so the rule is replaced with that address.",
      },
      {
        device: "hrouter",
        command: "nft add rule ip filter forward ip saddr 192.168.50.0/24 ip daddr 192.168.1.0/24 drop",
        why: "The forward chain decides what the router passes between networks. This rule drops anything from the guest block to the home block. Traffic from the guest to the outside server does not match it, so the guest still gets out.",
      },
    ],
  },
  checks: [
    {
      id: "laptop-out",
      label: "The laptop reaches the outside server, which sees the router's address",
      from: "laptop",
      to: "203.0.113.80",
      kind: "tcp",
      port: 8080,
      expect: "reach",
      seenAs: "203.0.113.1",
    },
    {
      id: "server-forward",
      label: "The outside server reaches the home web page through 203.0.113.1:8080",
      from: "server",
      to: "203.0.113.1",
      kind: "tcp",
      port: 8080,
      expect: "reach",
      seenBy: "homeweb",
    },
    {
      id: "guest-home",
      label: "The guest cannot reach the home web server",
      from: "guest",
      to: "192.168.1.20",
      kind: "tcp",
      port: 80,
      expect: "blocked",
    },
    {
      id: "guest-out",
      label: "The guest still reaches the outside server",
      from: "guest",
      to: "203.0.113.80",
      kind: "tcp",
      port: 8080,
      expect: "reach",
    },
    {
      id: "port-22-refused",
      label: "An unforwarded port, 203.0.113.1:22, is refused at once",
      from: "server",
      to: "203.0.113.1",
      kind: "tcp",
      port: 22,
      expect: "refused",
    },
  ],
};
