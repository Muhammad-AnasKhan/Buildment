import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 8.1 beat 5 (step 6 of the journey, the playable beat): the SYN arrives at
// hrouter's inside plug with TTL 64 (the sender's default, minus nothing yet).
// Forwarding is on, and the longest match for 203.0.113.80 is the default route
// via 198.51.100.1. The router rewrites the source IP to its outside address
// 198.51.100.2 (masquerade), lowers the TTL to 63, and sets the destination MAC
// to the next hop (prouter). The source port is kept unless two flows clash:
// the capstone runs and the challenge 4 run show a second device using the same
// source port 41000 getting a new port (15510). The pick asks for the one MAC
// that leaves the router. The table is a model view of conntrack -L. The
// renderer is NetStepCanvas; the model is models/net-step.ts.
const TITLE = "The home router changes the packet";
const PURPOSE = "At hrouter the source IP, the MAC and the TTL change. The source port stays unless two devices clash.";
const LIMITS =
  "Linux behaviour: masquerade rewrites the source address and keeps the port unless two flows clash. Other routers differ. Three made-up devices and made-up MACs. The NAT table is a simplified view of conntrack -L. The port numbers come from a recorded run.";

const HOME1_IP = "192.168.1.101";

export const netM8JourneyNatHopData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "home1", kind: "host", label: "home1", x: 70, y: 0 },
    { id: "hrouter", kind: "router", label: "hrouter", x: 350, y: 0, addresses: ["192.168.1.1", "198.51.100.2"] },
    { id: "prouter", kind: "router", label: "prouter", x: 350, y: 110, addresses: ["198.51.100.1", "203.0.113.1"] },
  ],
  links: [
    { from: "home1", to: "hrouter" },
    { from: "hrouter", to: "prouter" },
  ],
  tables: [{ id: "nat", title: "hrouter's NAT table", device: "hrouter", columns: ["Inside", "Server sees"], rows: [] }],
  steps: [
    {
      caption: "The SYN arrives at hrouter's inside plug. Watch five fields: source IP, destination IP, destination MAC, TTL and source port.",
      packet: {
        at: 0,
        fields: [
          { label: "src IP", value: HOME1_IP },
          { label: "dst IP", value: "203.0.113.80" },
          { label: "dst MAC", value: "02:00:00:00:00:01" },
          { label: "TTL", value: "64" },
          { label: "src port", value: "41000" },
        ],
      },
      highlight: { devices: ["hrouter"] },
    },
    {
      caption: "Forwarding is on. For 203.0.113.80 the longest match is the default route, next hop 198.51.100.1.",
      highlight: { devices: ["hrouter", "prouter"], links: [1] },
    },
    {
      caption: "hrouter rewrites the source IP, lowers the TTL and sets the next hop's MAC. The port stays.",
      packet: {
        at: 1,
        fields: [
          { label: "src IP", value: "198.51.100.2", changed: true },
          { label: "dst IP", value: "203.0.113.80" },
          { label: "dst MAC", value: "02:00:00:00:00:03", changed: true },
          { label: "TTL", value: "63", changed: true },
          { label: "src port", value: "41000" },
        ],
      },
      tableUpdates: [{ table: "nat", row: 0, cells: ["home1:41000", "198.51.100.2:41000"] }],
      highlight: { devices: ["hrouter", "prouter"], links: [1], rows: [{ table: "nat", row: 0 }] },
      verdict: { text: "Three fields changed, two kept", tone: "good" },
      pick: {
        prompt: "The SYN leaves hrouter for the next hop. Which destination MAC does it carry?",
        options: [
          { label: "home1's own MAC", correct: false, why: "home1's MAC belonged to the first link. The router builds a new frame for the next link." },
          { label: "The next hop's MAC", correct: true, why: "A MAC covers one link only. The next link ends at prouter, so the router sets prouter's MAC." },
          { label: "The server's MAC", correct: false, why: "The server is two links away. Its MAC is never in this packet. Each router sets a new one." },
        ],
      },
    },
    {
      caption: "Now home2 also sends from port 41000. The first mapping stays, so home2 gets a new port, 15510.",
      tableUpdates: [{ table: "nat", row: 1, cells: ["home2:41000", "198.51.100.2:15510"] }],
      highlight: { devices: ["hrouter"], rows: [{ table: "nat", row: 1 }] },
      verdict: { text: "The port changes only on a clash", tone: "accent" },
    },
  ],
};

function NatHopBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM8JourneyNatHopData });
}

export const netM8JourneyNatHop: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: NatHopBeat,
};
