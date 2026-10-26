import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 4.4 beat 3: traceroute sends probes with TTL 1, 2 and 3 toward
// 203.0.113.80. Probe 1 dies at R1, which replies from 192.168.1.1. Probe 2 dies
// at R2, which replies from 198.51.100.1. Probe 3 passes both routers and reaches
// the server, which answers from 203.0.113.80. Each reply names the device that
// stopped the probe, so line N of the trace is the device that stopped probe N.
// With traceroute -n across two routers the lab showed three lines: both
// routers, then the host. Addresses are made up: private ranges, and
// documentation ranges for public addresses. The renderer is NetStepCanvas; the
// model is models/net-step.ts.
const TITLE = "Traceroute sends TTL 1, 2, 3";
const PURPOSE = "Each probe has one more TTL than the last, so it dies one router further on. Each reply names the device that stopped it.";
const LIMITS =
  "Made-up devices on one path of two routers, IPv4 only, no NAT. The table is a model view of the lines traceroute prints, with the times left out. Real traceroute sends UDP probes by default; this picture sends one probe per line and does not show the probe type. No rate limits are drawn.";

const probe = (ttl: string, changed?: boolean) => [
  { label: "src IP", value: "192.168.1.23" },
  { label: "dst IP", value: "203.0.113.80" },
  { label: "TTL", value: ttl, ...(changed ? { changed: true } : {}) },
];

const reply = (from: string, kind?: string) => [
  { label: "src IP", value: from },
  { label: "dst IP", value: "192.168.1.23" },
  ...(kind ? [{ label: "ICMP", value: kind }] : []),
];

export const netM4TracerouteProbesData: NetStepData = {
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
  tables: [{ id: "trace", title: "The laptop's trace", device: "laptop", columns: ["Line", "Reply from"], rows: [] }],
  steps: [
    {
      caption: "Traceroute sends probe 1 toward 203.0.113.80 with TTL 1.",
      packet: { at: 0, fields: probe("1") },
      highlight: { devices: ["laptop"] },
    },
    {
      caption: "R1 discards it and replies from 192.168.1.1. Line 1 of the trace is R1.",
      packet: { at: 0, reverse: true, fields: reply("192.168.1.1", "Time Exceeded") },
      tableUpdates: [{ table: "trace", row: 0, cells: ["1", "192.168.1.1"] }],
      highlight: { devices: ["r1"], rows: [{ table: "trace", row: 0 }] },
    },
    {
      caption: "Probe 2 has TTL 2. R1 lowers it to 1 and passes it on to R2.",
      packet: { at: 1, fields: probe("1", true) },
      highlight: { devices: ["r1"] },
    },
    {
      caption: "R2 lowers the TTL to 0, discards the probe and replies from 198.51.100.1. That is line 2.",
      packet: { at: 1, reverse: true, fields: reply("198.51.100.1", "Time Exceeded") },
      tableUpdates: [{ table: "trace", row: 1, cells: ["2", "198.51.100.1"] }],
      highlight: { devices: ["r2"], rows: [{ table: "trace", row: 1 }] },
    },
    {
      caption: "R1 and R2 each lower the TTL and pass probe 3 on. It reaches the server with TTL 1.",
      packet: { at: 2, fields: probe("1", true) },
      highlight: { devices: ["server"] },
      pick: {
        prompt: "Probe 3 has TTL 3, and two routers lie ahead. Where does it end?",
        options: [
          { label: "At the server, which answers", correct: true, why: "Two routers use up two of the three counts. One count is left, so the probe arrives." },
          { label: "At R2, like probe 2", correct: false, why: "Probe 2 had TTL 2 and ran out at R2. Probe 3 has one more count." },
          { label: "At R1, like probe 1", correct: false, why: "Probe 1 had TTL 1 and ran out at R1. Probe 3 has two more counts." },
        ],
      },
    },
    {
      caption: "The server answers from its own address, 203.0.113.80. Line 3 of the trace is the server.",
      packet: { at: 2, reverse: true, fields: reply("203.0.113.80") },
      tableUpdates: [{ table: "trace", row: 2, cells: ["3", "203.0.113.80"] }],
      highlight: { devices: ["server"], rows: [{ table: "trace", row: 2 }] },
      verdict: { text: "Three probes, three addresses", tone: "good" },
    },
  ],
};

function TracerouteProbesBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM4TracerouteProbesData });
}

export const netM4TracerouteProbes: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: TracerouteProbesBeat,
};
