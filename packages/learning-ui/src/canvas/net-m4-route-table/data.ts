import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 4.3 beat 1: a router's table, four rows. A connected row (192.168.1.0/24, no
// next hop: the router has a plug on that network), 10.0.0.0/8 via Router A,
// 10.1.0.0/16 via Router B, and a default via the provider. Each row says: for
// addresses in this block, hand the packet to this next hop. The table is a
// model view of what ip route lists, not a recording. The topology and next
// hops match net-m4-route-longest. Addresses are made up: private ranges inside
// the lab, a documentation range (203.0.113.0/24) for the provider. The
// renderer is NetStepCanvas; the model is models/net-step.ts.
const TITLE = "A router keeps a table of routes";
const PURPOSE = "A router decides with a list of rows. Each row names a block of addresses and the next hop for packets inside that block.";
const LIMITS =
  "A model of one router with four rows. A real table holds more rows and more columns, such as the interface and the metric, and ip route lists it for real. Static rows only: no routing protocols. The addresses are made up.";

const ROWS = [
  ["192.168.1.0/24", "none, direct"],
  ["10.0.0.0/8", "10.0.0.2"],
  ["10.1.0.0/16", "10.1.0.2"],
  ["default", "203.0.113.2"],
];

export const netM4RouteTableData: NetStepData = {
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
  tables: [{ id: "routes", title: "The router's table", device: "router", columns: ["Destination", "Next hop"], rows: ROWS }],
  steps: [
    {
      caption: "A router decides with a table. Each row is a block of addresses and a next hop.",
      highlight: { devices: ["router"] },
    },
    {
      caption: "Row 2: for any address in 10.0.0.0/8, hand the packet to Router A at 10.0.0.2.",
      highlight: { devices: ["router-a"], links: [1], rows: [{ table: "routes", row: 1 }] },
    },
    {
      caption: "Row 3 does the same for 10.1.0.0/16, with Router B as the next hop.",
      highlight: { devices: ["router-b"], links: [2], rows: [{ table: "routes", row: 2 }] },
    },
    {
      caption: "The last row, default, is for everything else. Its next hop is the provider.",
      highlight: { devices: ["provider"], links: [3], rows: [{ table: "routes", row: 3 }] },
    },
    {
      caption: "Row 1 has no next hop: the router has a plug on that network, so it delivers there directly.",
      highlight: { devices: ["laptop"], links: [0], rows: [{ table: "routes", row: 0 }] },
      verdict: { text: "A row: a block and a next hop", tone: "accent" },
      pick: {
        prompt: "Row 1 is 192.168.1.0/24 with no next hop. What does the router do for such a packet?",
        options: [
          { label: "Sends it to the default next hop", correct: false, why: "The default row is the last resort. A more specific row, even one with no next hop, comes first." },
          { label: "Drops it: no next hop, no route", correct: false, why: "No next hop does not mean no route. It means the destination is on a network the router is plugged into." },
          { label: "Delivers it directly on the link", correct: true, why: "The router has a plug on 192.168.1.0/24, so the destination is one link away and no other router is needed." },
        ],
      },
    },
  ],
};

function RouteTableBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM4RouteTableData });
}

export const netM4RouteTable: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: RouteTableBeat,
};
