import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 4.3 beat 2: a packet for 10.1.2.3 reaches a router with four rows. The
// router checks each row: 10.0.0.0/8 holds the address (first number 10),
// 10.1.0.0/16 holds it (first two numbers 10.1), default holds every address,
// and 192.168.1.0/24 does not (first number 192). Three of four rows match, so
// the router must choose. Which one it chooses is the next beat. The table is a
// model view of what ip route lists, not a recording. The topology matches
// net-m4-route-table. The renderer is NetStepCanvas; the model is
// models/net-step.ts.
const TITLE = "Several rows can match one address";
const PURPOSE = "A packet for 10.1.2.3 arrives. Three of the router's four rows contain that address, so the router has a choice to make.";
const LIMITS =
  "A model of one router with four rows. The learner cannot type another destination here: the steps check 10.1.2.3 only. A real table holds more rows, and ip route lists it for real. Static rows only. The addresses are made up.";

const ROWS = [
  ["192.168.1.0/24", "none, direct"],
  ["10.0.0.0/8", "10.0.0.2"],
  ["10.1.0.0/16", "10.1.0.2"],
  ["default", "203.0.113.2"],
];

export const netM4RouteMatchesData: NetStepData = {
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
      caption: "A packet for 10.1.2.3 arrives. Which rows contain that address?",
      packet: {
        at: 0,
        fields: [
          { label: "src IP", value: "192.168.1.23" },
          { label: "dst IP", value: "10.1.2.3" },
          { label: "TTL", value: "64" },
        ],
      },
      highlight: { devices: ["router"] },
    },
    {
      caption: "Row 2, 10.0.0.0/8: the first number is 10, so this row holds 10.1.2.3.",
      highlight: { devices: ["router"], rows: [{ table: "routes", row: 1 }] },
    },
    {
      caption: "Row 3, 10.1.0.0/16: the first two numbers are 10.1, so this row holds it too.",
      highlight: { devices: ["router"], rows: [{ table: "routes", row: 2 }] },
    },
    {
      caption: "Row 4, default, holds every address.",
      highlight: { devices: ["router"], rows: [{ table: "routes", row: 3 }] },
    },
    {
      caption: "Row 1 does not match: its first number is 192, not 10. Three rows match, so the router must choose.",
      highlight: { devices: ["router"], rows: [{ table: "routes", row: 1 }, { table: "routes", row: 2 }, { table: "routes", row: 3 }] },
      verdict: { text: "3 of 4 rows match 10.1.2.3", tone: "accent" },
      pick: {
        prompt: "Row 1 is 192.168.1.0/24. Does it hold the address 10.1.2.3?",
        options: [
          { label: "No, its first number is 192", correct: true, why: "A /24 fixes the first three numbers, 192.168.1. The address starts with 10.1.2, so it is outside the block." },
          { label: "Yes, both are private addresses", correct: false, why: "Both are private, but a row matches on its own block of addresses, not on the kind of address." },
          { label: "Yes, it is the first row", correct: false, why: "A row's place in the list does not make it match. Only the addresses in its block match." },
        ],
      },
    },
  ],
};

function RouteMatchesBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM4RouteMatchesData });
}

export const netM4RouteMatches: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: RouteMatchesBeat,
};
