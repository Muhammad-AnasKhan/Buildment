import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 4.3 beat 5: two rows with the same prefix, 10.1.0.0/16: two ways to reach
// the same block. Both hold 10.1.2.3 and both have the same length, so the
// prefix cannot decide. The metric breaks the tie and the lower number wins:
// 100 beats 200, so the packet goes to Router B. Then row 1's metric changes to
// 300 and row 2 (200) wins, so the packet goes to Router A. The table is a model
// view of what ip route lists, not a recording. The renderer is NetStepCanvas;
// the model is models/net-step.ts.
const TITLE = "Same length: the lower metric wins";
const PURPOSE = "Two rows have the same prefix length and both hold the address. The router uses the row with the lower metric.";
const LIMITS =
  "A model of one router with three rows and made-up metrics. The learner cannot type a metric: the picture changes one for you. A real table shows the metric in ip route output, and routing programs often set it. Two rows with the same length and the same metric are not drawn. The addresses are made up.";

const packetFor = (ttl: string, changed?: boolean) => [
  { label: "src IP", value: "192.168.1.23" },
  { label: "dst IP", value: "10.1.2.3" },
  { label: "TTL", value: ttl, ...(changed ? { changed: true } : {}) },
];

export const netM4RouteMetricData: NetStepData = {
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
      columns: ["Destination", "Next hop", "Metric"],
      rows: [
        ["10.1.0.0/16", "10.1.0.2", "100"],
        ["10.1.0.0/16", "10.0.0.2", "200"],
        ["default", "203.0.113.2", "100"],
      ],
    },
  ],
  steps: [
    {
      caption: "For 10.1.2.3, rows 1 and 2 are both 10.1.0.0/16. The metric is a cost: lower is cheaper.",
      packet: { at: 0, fields: packetFor("64") },
      highlight: { devices: ["router"], rows: [{ table: "routes", row: 0 }, { table: "routes", row: 1 }] },
    },
    {
      caption: "Row 1 wins: same prefix length, lower metric. The packet goes to Router B, its next hop, with TTL 63.",
      packet: { at: 2, fields: packetFor("63", true) },
      highlight: { devices: ["router-b"], rows: [{ table: "routes", row: 0 }] },
      pick: {
        prompt: "Both rows are a /16 and both hold 10.1.2.3. Which one does the router use?",
        options: [
          { label: "Row 1, metric 100", correct: true, why: "The prefix length is a tie, so the metric decides. The lower number, 100, wins." },
          { label: "Row 2, metric 200", correct: false, why: "A bigger metric is the worse route, not the better one. Lower wins." },
          { label: "Both, taking turns", correct: false, why: "This table has no rule for sharing. The router uses one row for the packet." },
        ],
      },
    },
    {
      caption: "Now row 1's metric changes from 100 to 300, for example because its path became worse.",
      tableUpdates: [{ table: "routes", row: 0, cells: ["10.1.0.0/16", "10.1.0.2", "300"] }],
      highlight: { devices: ["router"], rows: [{ table: "routes", row: 0 }] },
    },
    {
      caption: "Row 2 now has the lower metric, 200 against 300. The same packet goes to Router A instead.",
      packet: { at: 1, fields: packetFor("63", true) },
      highlight: { devices: ["router-a"], rows: [{ table: "routes", row: 1 }] },
      verdict: { text: "Lower metric wins the tie", tone: "good" },
    },
  ],
};

function RouteMetricBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM4RouteMetricData });
}

export const netM4RouteMetric: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: RouteMetricBeat,
};
