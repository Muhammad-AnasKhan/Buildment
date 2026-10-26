import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 4.3 beat 4: the same three rows as net-m4-route-longest, listed in a new
// order. The router picks the row with the longest prefix, not the first one
// listed, so the packet for 10.1.2.3 still leaves by the /16 toward Router B,
// with TTL 63 (TTL 64 at the sender, minus one per router). The table is a
// model view of what ip route lists, not a recording. The renderer is
// NetStepCanvas; the model is models/net-step.ts.
const TITLE = "List order never decides";
const PURPOSE = "The same three rows in a new order. The router still picks the most specific row for 10.1.2.3, wherever it sits in the list.";
const LIMITS =
  "A model of one router with three rows. The learner cannot drag the rows: the picture shows two fixed orders. A real table holds more rows, and ip route lists it for real. Rows of equal length are separated by the metric, which the next beats show. The addresses are made up.";

const ORIGINAL = [
  ["10.0.0.0/8", "10.0.0.2"],
  ["10.1.0.0/16", "10.1.0.2"],
  ["default", "203.0.113.2"],
];

const packetFor = (ttl: string, changed?: boolean) => [
  { label: "src IP", value: "192.168.1.23" },
  { label: "dst IP", value: "10.1.2.3" },
  { label: "TTL", value: ttl, ...(changed ? { changed: true } : {}) },
];

export const netM4RouteReorderData: NetStepData = {
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
  tables: [{ id: "routes", title: "The router's table", device: "router", columns: ["Destination", "Next hop"], rows: ORIGINAL }],
  steps: [
    {
      caption: "The same packet, for 10.1.2.3, and the same three rows. Listed order: /8, /16, default.",
      packet: { at: 0, fields: packetFor("64") },
      highlight: { devices: ["router"] },
    },
    {
      caption: "Now the same rows in another order: default first, then the /8, and the /16 last.",
      tableUpdates: [
        { table: "routes", row: 0, cells: ["default", "203.0.113.2"] },
        { table: "routes", row: 1, cells: ["10.0.0.0/8", "10.0.0.2"] },
        { table: "routes", row: 2, cells: ["10.1.0.0/16", "10.1.0.2"] },
      ],
      highlight: { devices: ["router"] },
    },
    {
      caption: "The router checks all the rows and still picks the /16. The packet goes to Router B with TTL 63.",
      packet: { at: 2, fields: packetFor("63", true) },
      highlight: { devices: ["router-b"], rows: [{ table: "routes", row: 2 }] },
      verdict: { text: "Same packet, same row, any order", tone: "good" },
      pick: {
        prompt: "The /16 is now the last row. Which row does the router use for 10.1.2.3?",
        options: [
          { label: "default, it is listed first", correct: false, why: "Default matches every address, so it is the vaguest row. The list order does not give it priority." },
          { label: "10.1.0.0/16, still the longest", correct: true, why: "The router compares prefix lengths, not positions. The /16 is the most specific match wherever it sits." },
          { label: "10.0.0.0/8, in the middle", correct: false, why: "The /8 also holds the address, but it is less specific than the /16. Its place in the list does not help it." },
        ],
      },
    },
  ],
};

function RouteReorderBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM4RouteReorderData });
}

export const netM4RouteReorder: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: RouteReorderBeat,
};
