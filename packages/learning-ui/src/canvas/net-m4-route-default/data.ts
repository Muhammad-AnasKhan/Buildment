import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 4.3 beat 6: every computer has a routing table, a laptop too. The laptop
// (192.168.1.23) has two rows: its connected network, 192.168.1.0/24, with no
// next hop, and a default row via the gateway R1 (192.168.1.1). A packet for
// the printer at 192.168.1.40 matches the connected row and goes straight to
// the printer. A packet for 203.0.113.80 matches only the default row and goes
// to R1. The two rows are the ones the recorded laptop of challenge 2 has
// (192.168.1.0/24 on its plug, default via 192.168.1.1); the table here is a
// model view. Addresses are made up: private ranges, and a documentation range
// for the server. The renderer is NetStepCanvas; the model is
// models/net-step.ts.
const TITLE = "Connected routes and the default";
const PURPOSE = "The laptop's table has a connected row and a default row. A neighbour matches the connected row. A far server matches only the default row.";
const LIMITS =
  "A model of one laptop with two rows. A real laptop may have more rows, and ip route lists them for real. The router R1 and the path beyond it are drawn as one hop. Static rows only. The addresses are made up, and the documentation range stands for a public address.";

const packetFor = (dst: string) => [
  { label: "src IP", value: "192.168.1.23" },
  { label: "dst IP", value: dst },
];

export const netM4RouteDefaultData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "laptop", kind: "host", label: "Laptop", x: 70, y: 0, addresses: ["192.168.1.23"] },
    { id: "switch", kind: "switch", label: "Switch", x: 210, y: 90 },
    { id: "printer", kind: "host", label: "Printer", x: 350, y: 0, addresses: ["192.168.1.40"] },
    { id: "r1", kind: "router", label: "R1", x: 70, y: 190, addresses: ["192.168.1.1"] },
    { id: "server", kind: "server", label: "Server", x: 350, y: 190, addresses: ["203.0.113.80"] },
  ],
  links: [
    { from: "laptop", to: "switch" },
    { from: "switch", to: "printer" },
    { from: "switch", to: "r1" },
    { from: "r1", to: "server", label: "more hops" },
  ],
  tables: [
    {
      id: "routes",
      title: "The laptop's table",
      device: "laptop",
      columns: ["Destination", "Next hop"],
      rows: [
        ["192.168.1.0/24", "none, direct"],
        ["default", "192.168.1.1"],
      ],
    },
  ],
  steps: [
    {
      caption: "Every computer has a routing table, a laptop too. This one has two rows.",
      highlight: { devices: ["laptop"] },
    },
    {
      caption: "The laptop sends to the printer at 192.168.1.40. Only row 1, 192.168.1.0/24, holds that address.",
      packet: { at: 0, fields: packetFor("192.168.1.40") },
      highlight: { rows: [{ table: "routes", row: 0 }] },
    },
    {
      caption: "Row 1 has no next hop, so the packet goes straight to the printer on the same network.",
      packet: { at: 1, fields: packetFor("192.168.1.40") },
      highlight: { devices: ["printer"], rows: [{ table: "routes", row: 0 }] },
    },
    {
      caption: "Only the default row holds 203.0.113.80. The laptop hands the packet to its next hop, R1.",
      packet: { at: 2, fields: packetFor("203.0.113.80") },
      highlight: { devices: ["r1"], rows: [{ table: "routes", row: 1 }] },
      pick: {
        prompt: "Now a packet for 203.0.113.80. Which row does the laptop use?",
        options: [
          { label: "192.168.1.0/24, no next hop", correct: false, why: "That row holds only addresses that start with 192.168.1. The server's address is outside the block." },
          { label: "default, via 192.168.1.1", correct: true, why: "Default holds every address. No other row holds this one, so it is the only match." },
          { label: "No row fits, so it is dropped", correct: false, why: "The default row always fits. A packet is dropped only when no row holds it, not even a default." },
        ],
      },
    },
    {
      caption: "Connected rows send direct. Everything else matches only the default, so it goes to the gateway.",
      highlight: { rows: [{ table: "routes", row: 0 }, { table: "routes", row: 1 }] },
      verdict: { text: "On-link: direct. Else: the default", tone: "good" },
    },
  ],
};

function RouteDefaultBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM4RouteDefaultData });
}

export const netM4RouteDefault: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: RouteDefaultBeat,
};
