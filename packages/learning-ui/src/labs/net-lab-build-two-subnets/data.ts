import type { NetLabSpec } from "../types";

// Chapter 4.7 in the networking roadmap: build the router that joins two
// subnets. The canvas starts empty; the goals are what the finished network
// must do.
export const netLabBuildTwoSubnets: NetLabSpec = {
  slug: "net-lab-build-two-subnets",
  family: "net",
  mode: "build",
  title: "Build a router",
  purpose: "A laptop and a server sit on different subnets. Place them, add a router, cable everything and set the addresses until they can talk.",
  limits:
    "IPv4 only, one packet at a time, Linux behaviour (iproute2 output from Ubuntu 24.04). No DHCP, DNS or NAT in this lab, and every address must be private or from the documentation blocks.",
  hints: [
    "A device only talks directly to addresses inside its own subnet. Anything else goes to its default gateway.",
    "The router needs one interface in each subnet, and each interface address is the gateway for the machines on that side.",
    "If a ping gets there but the answer is lost, check that the server also knows a way back.",
  ],
  tasks: [
    "Put a laptop on 192.168.1.0/24 and a server at 203.0.113.80 on 203.0.113.0/24.",
    "Join the two subnets with a router, one cable and one address per side.",
    "Press Run, then check the goals and try ping and traceroute from the laptop.",
  ],
  suggested: ["ip addr", "ip route", "ping -c 2 203.0.113.80", "traceroute -n 203.0.113.80"],
  palette: [
    { id: "laptop", kind: "host", label: "Laptop", max: 1 },
    {
      id: "server",
      kind: "host",
      label: "Server",
      max: 1,
      sockets: [{ proto: "tcp", addr: "0.0.0.0", port: 80, process: "nginx", reply: "<h1>Hello from the server</h1>" }],
    },
    { id: "router", kind: "router", label: "Router", max: 1 },
    { id: "switch", kind: "switch", label: "Switch", max: 2, ports: 4 },
  ],
  goals: [
    { id: "laptop-subnet", label: "The laptop is on 192.168.1.0/24", kind: "address", device: "laptop", block: "192.168.1.0/24" },
    { id: "server-subnet", label: "The server is at 203.0.113.80", kind: "address", device: "server", block: "203.0.113.80/32" },
    { id: "laptop-server", label: "The laptop pings the server", kind: "ping", from: "laptop", to: "203.0.113.80" },
    {
      id: "laptop-trace",
      label: "traceroute from the laptop shows the router, then the server",
      kind: "path",
      from: "laptop",
      to: "203.0.113.80",
      hops: ["router", "203.0.113.80"],
    },
    { id: "server-laptop", label: "The server reaches the laptop", kind: "ping", from: "server", to: "laptop" },
  ],
  solution: {
    summary:
      "The router is the only device with a foot in both subnets, so it is the only one that can carry a packet from one to the other. Each end machine sends everything outside its own subnet to the router interface on its side (its default gateway), and the router forwards between its two interfaces.",
    build: {
      seed: {
        devices: [
          { part: "laptop", x: 90, y: 180, addrs: { eth0: "192.168.1.23/24" }, gateway: "192.168.1.1" },
          { part: "router", x: 320, y: 180, addrs: { eth0: "192.168.1.1/24", eth1: "203.0.113.1/24" } },
          { part: "server", x: 550, y: 180, addrs: { eth0: "203.0.113.80/24" }, gateway: "203.0.113.1" },
        ],
        cables: [
          { a: "laptop.eth0", b: "router.eth0" },
          { a: "router.eth1", b: "server.eth0" },
        ],
      },
      steps: [
        { text: "Place the laptop, the router and the server, and cable the laptop to the router.", why: "The laptop's only way off its own subnet is a cable to something that forwards. This cable lands on the router's eth0." },
        { text: "Cable the router to the server.", why: "A second cable gives the router a second interface, eth1, so it has a foot in each subnet." },
        { text: "Give the laptop 192.168.1.23/24 and the router's eth0 192.168.1.1/24.", why: "Both sit in 192.168.1.0/24, so the laptop can reach the router directly, with no gateway needed for that." },
        { text: "Give the router's eth1 203.0.113.1/24 and the server 203.0.113.80/24.", why: "Now the server and the router share 203.0.113.0/24. The router has an address in each subnet." },
        { text: "Set the laptop's default gateway to 192.168.1.1.", why: "203.0.113.80 is outside the laptop's subnet, so it hands the packet to its gateway, the router." },
        { text: "Set the server's default gateway to 203.0.113.1.", why: "Without it the server could receive the ping but not answer: 192.168.1.23 is outside its subnet and it would have no route back." },
      ],
    },
  },
};
