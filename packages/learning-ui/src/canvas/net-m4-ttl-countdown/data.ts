import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 4.4 beat 1: TTL is a countdown carried in every packet. A Linux computer
// starts it at 64; each router lowers it by one, so the server sees 62 after two
// routers (64 minus the number of routers, as the lab's capture showed). A
// second run starts at TTL 2: R1 lowers it to 1 and forwards it, and R2, which
// would lower it to 0, discards the packet instead. The path is laptop, R1, R2,
// server, with no NAT. Addresses are made up: private ranges, and documentation
// ranges for public addresses. The renderer is NetStepCanvas; the model is
// models/net-step.ts.
const TITLE = "TTL is a countdown in every packet";
const PURPOSE = "Each router lowers the TTL by one. A packet that starts at 64 reaches the server with 62. A packet that runs out of TTL is discarded.";
const LIMITS =
  "Made-up devices on one path of two routers, IPv4 only, no NAT. The picture shows two runs, TTL 64 and TTL 2: the learner cannot type a starting TTL. A traceroute probe sets a low TTL on purpose; an ordinary Linux packet starts at 64. What the router does after the discard is the next beat.";

const packetFor = (ttl: string, changed?: boolean) => [
  { label: "src IP", value: "192.168.1.23" },
  { label: "dst IP", value: "203.0.113.80" },
  { label: "TTL", value: ttl, ...(changed ? { changed: true } : {}) },
];

export const netM4TtlCountdownData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "laptop", kind: "host", label: "Laptop", x: 70, y: 0, addresses: ["192.168.1.23"] },
    { id: "r1", kind: "router", label: "R1", x: 350, y: 0, addresses: ["192.168.1.1", "198.51.100.2"] },
    { id: "r2", kind: "router", label: "R2", x: 350, y: 110, addresses: ["198.51.100.1", "203.0.113.1"] },
    { id: "server", kind: "server", label: "Server", x: 70, y: 110, addresses: ["203.0.113.80"] },
  ],
  links: [
    { from: "laptop", to: "r1" },
    { from: "r1", to: "r2" },
    { from: "r2", to: "server" },
  ],
  steps: [
    {
      caption: "The laptop sends a packet to 203.0.113.80. A Linux computer starts the TTL at 64.",
      packet: { at: 0, fields: packetFor("64") },
      highlight: { devices: ["laptop"] },
    },
    {
      caption: "R1 lowers the TTL by one and forwards the packet. The TTL is now 63.",
      packet: { at: 1, fields: packetFor("63", true) },
      highlight: { devices: ["r1"] },
    },
    {
      caption: "R2 lowers it again. The server receives the packet with TTL 62.",
      packet: { at: 2, fields: packetFor("62", true) },
      highlight: { devices: ["server"] },
      verdict: { text: "64 minus 2 routers is 62", tone: "good" },
    },
    {
      caption: "Second run: the laptop starts at TTL 2. A packet at TTL 0 must not travel on.",
      packet: { at: 0, fields: packetFor("2") },
      highlight: { devices: ["laptop"] },
    },
    {
      caption: "R1 lowers the TTL to 1 and forwards the packet to R2.",
      packet: { at: 1, fields: packetFor("1", true) },
      highlight: { devices: ["r1"] },
    },
    {
      caption: "R2 would lower the TTL to 0, so it discards the packet. The server never sees it.",
      highlight: { devices: ["r2"] },
      verdict: { text: "TTL reached 0: packet discarded", tone: "bad" },
      pick: {
        prompt: "The packet reaches R2 with TTL 1. What does R2 do with it?",
        options: [
          { label: "Lowers it to 0 and forwards it", correct: false, why: "A packet with TTL 0 must not travel on. The router checks the count before it forwards." },
          { label: "Lowers it to 0 and discards it", correct: true, why: "A router lowers the TTL by at least one, and at zero it discards the packet." },
          { label: "Forwards it with TTL unchanged", correct: false, why: "Every router lowers the TTL. That is what makes the countdown work." },
        ],
      },
    },
  ],
};

function TtlCountdownBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM4TtlCountdownData });
}

export const netM4TtlCountdown: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: TtlCountdownBeat,
};
