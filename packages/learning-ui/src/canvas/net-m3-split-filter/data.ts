import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 3.4 beat 4: splitting alone does not keep guests out. The guest network
// (10.0.2.0/23), the exam network (10.0.0.128/30) and the router are made up;
// they sit inside one 10.0.0.0/22 block. With no rule, a guest packet for the
// exam server is forwarded by the router and arrives. After one rule at the
// router (drop packets from the guest network to the exam network) the same
// packet is dropped. The rule table is a model view of one forwarding rule, not
// a recording. In the lab a router using NAT alone allowed a connection once a
// route was added, and a separate forwarding drop rule blocked guest-to-home
// traffic, so the path and the access decision are two things. The renderer is
// NetStepCanvas; the model is models/net-step.ts.
const TITLE = "Splitting alone does not keep guests out";
const PURPOSE = "A guest packet reaches the exam server through the router. One rule at the router then drops it.";
const LIMITS =
  "Three made-up devices with private addresses. The rule is one narrow model rule: drop guest to exam server. It does not claim to stop every threat or to protect the server's software, and it is not a free-form firewall. The picture assumes the router already has a route between the networks.";

const GUEST_PACKET = [
  { label: "src IP", value: "10.0.2.9" },
  { label: "dst IP", value: "10.0.0.130" },
];

export const netM3SplitFilterData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "guest", kind: "phone", label: "Guest", x: 70, y: 0, addresses: ["10.0.2.9"] },
    { id: "router", kind: "router", label: "Router", x: 210, y: 110, addresses: ["10.0.2.1", "10.0.0.129"] },
    { id: "exam", kind: "server", label: "Exam", x: 350, y: 0, addresses: ["10.0.0.130"] },
  ],
  links: [
    { from: "guest", to: "router" },
    { from: "router", to: "exam" },
  ],
  tables: [{ id: "rules", title: "Router's forward rules", device: "router", columns: ["Action", "From", "To"], rows: [] }],
  steps: [
    {
      caption: "Guests and the exam server are on separate networks joined by a router. There are no rules yet.",
      highlight: { devices: ["router"] },
    },
    {
      caption: "A guest phone sends a packet to the exam server. It goes to the router first.",
      packet: { at: 0, fields: GUEST_PACKET },
      highlight: { devices: ["router"] },
      pick: {
        prompt: "A guest phone sends a packet to the exam server. The networks are split, with no rules. Does it arrive?",
        options: [
          { label: "No, the split blocks it", correct: false, why: "A split makes separate networks, but the router still forwards between them unless a rule says no." },
          { label: "Yes, the router forwards it", correct: true, why: "With no rule, the router passes packets between its networks." },
          { label: "Only if the server agrees", correct: false, why: "The router decides before the server sees anything, and nothing here asks the server." },
        ],
      },
    },
    {
      caption: "With no rule, the router has no reason to stop it. It forwards the packet to the exam server.",
      packet: { at: 1, fields: GUEST_PACKET },
      highlight: { devices: ["exam"] },
      verdict: { text: "Delivered: the split blocked nothing", tone: "bad" },
    },
    {
      caption: "Now the school adds one rule at the router: drop packets from guests to the exam server.",
      tableUpdates: [{ table: "rules", row: 0, cells: ["drop", "10.0.2.0/23", "10.0.0.128/30"] }],
      highlight: { devices: ["router"], rows: [{ table: "rules", row: 0 }] },
    },
    {
      caption: "The same guest sends the same packet again, now with the rule in place.",
      packet: { at: 0, fields: GUEST_PACKET },
      highlight: { devices: ["router"], rows: [{ table: "rules", row: 0 }] },
    },
    {
      caption: "The router matches the rule and drops the packet. The exam server receives nothing.",
      highlight: { devices: ["router"], rows: [{ table: "rules", row: 0 }] },
      verdict: { text: "Dropped by the router rule", tone: "good" },
    },
  ],
};

function SplitFilterBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM3SplitFilterData });
}

export const netM3SplitFilter: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: SplitFilterBeat,
};
