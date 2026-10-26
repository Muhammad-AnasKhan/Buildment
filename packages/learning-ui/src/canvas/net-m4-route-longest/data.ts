import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 4.2: a router with three rows in its table, 10.0.0.0/8, 10.1.0.0/16 and a
// default, receives a packet for 10.1.2.3. All three rows match; the router
// uses the most specific one, the longest prefix, and lowers the TTL from 64
// to 63 (TTL 64 at the sender, minus one per router). The table is a model
// view of what ip route lists, not a recording. Addresses are made up: private
// ranges inside the lab, a documentation range (203.0.113.0/24) for the
// provider. The renderer is NetStepCanvas; the model is models/net-step.ts.
const TITLE = "The longest prefix wins";
const PURPOSE = "A packet for 10.1.2.3 matches three rows of the router's table. The router picks the most specific one.";
const LIMITS =
  "A model of one router with three rows. A real table holds many more rows and shows more columns, and ip route lists it for real. When two rows have the same prefix length, the metric breaks the tie, which is not drawn here. The addresses are made up.";

const packetFor = (ttl: string, changed?: boolean) => [
  { label: "src IP", value: "192.168.1.23" },
  { label: "dst IP", value: "10.1.2.3" },
  { label: "TTL", value: ttl, ...(changed ? { changed: true } : {}) },
];

export const netM4RouteLongestData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "laptop", kind: "host", label: "Laptop", x: 210, y: 0, addresses: ["192.168.1.23"] },
    { id: "router", kind: "router", label: "Router", x: 210, y: 100, addresses: ["192.168.1.1"] },
    { id: "router-a", kind: "router", label: "Router A", x: 70, y: 200, addresses: ["10.0.0.2"] },
    { id: "router-b", kind: "router", label: "Router B", x: 210, y: 200, addresses: ["10.1.0.2"] },
    { id: "provider", kind: "cloud", label: "Provider", x: 350, y: 200, addresses: ["203.0.113.2"] },
  ],
  links: [
    { from: "laptop", to: "router" },
    { from: "router", to: "router-a" },
    { from: "router", to: "router-b" },
    { from: "router", to: "provider" },
  ],
  tables: [
    {
      id: "routes",
      title: "The router's table",
      device: "router",
      columns: ["Destination", "Next hop"],
      rows: [
        ["10.0.0.0/8", "10.0.0.2"],
        ["10.1.0.0/16", "10.1.0.2"],
        ["default", "203.0.113.2"],
      ],
    },
  ],
  steps: [
    {
      caption: "A packet for 10.1.2.3 reaches the router. The router must choose one row of its table.",
      packet: { at: 0, fields: packetFor("64") },
      highlight: { devices: ["router"] },
    },
    {
      caption: "10.1.2.3 fits three rows. The router uses the most specific one: the longest prefix, the /16.",
      highlight: { devices: ["router"], rows: [{ table: "routes", row: 1 }] },
      pick: {
        prompt: "10.1.2.3 matches all three rows. Which row does the router use?",
        options: [
          { label: "10.0.0.0/8, listed first", correct: false, why: "The order of rows does not decide. A /8 fixes only 8 bits, a vaguer match than the /16." },
          { label: "10.1.0.0/16, longest prefix", correct: true, why: "A /16 fixes 16 bits of the address, more than the /8 or default, so it is the most specific match." },
          { label: "default, matches anything", correct: false, why: "Default is the last resort. It is used only when no more specific row matches." },
        ],
      },
    },
    {
      caption: "The router lowers TTL to 63 and sends the packet to Router B, the next hop of that row.",
      packet: { at: 2, fields: packetFor("63", true) },
      highlight: { devices: ["router-b"], rows: [{ table: "routes", row: 1 }] },
      verdict: { text: "Longest prefix wins: the /16", tone: "good" },
    },
  ],
};

function RouteLongestBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM4RouteLongestData });
}

export const netM4RouteLongest: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: RouteLongestBeat,
};
