import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 3.4 beat 3: the same school and the same broadcast, after the groups move onto
// three separate networks joined by a router. The staff laptop sends the same ARP
// request. The staff network floods it, so 99 other staff laptops hear it. The
// router hears it on its staff side and does not pass a local broadcast to the
// guest or the exam network, so those hear nothing. 99 recipients instead of 599,
// 500 fewer. The counts are the model's, not a measurement. The addresses are
// private and the MACs are made up (02:...). The renderer is NetStepCanvas; the
// model is models/net-step.ts.
const TITLE = "Three networks joined by a router";
const PURPOSE = "The same laptop sends the same request, but the groups are on separate networks. Only the 99 other staff laptops hear it.";
const LIMITS =
  "A made-up school, not a measurement. Each network is one card with a count, and the router's work between networks is left for module 4. The picture counts who hears one request. It says nothing about speed, and it does not claim that every possible fault stops at the router.";

const REQUEST = [
  { label: "src MAC", value: "02:00:00:00:00:07" },
  { label: "dst MAC", value: "ff:ff:ff:ff:ff:ff" },
  { label: "ARP", value: "request" },
  { label: "who has", value: "10.0.0.9" },
  { label: "tell", value: "10.0.0.7" },
];

export const netM3SplitBroadcastData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "laptop", kind: "host", label: "Laptop", x: 70, y: 0, addresses: ["10.0.0.7"] },
    { id: "staff", kind: "switch", label: "Staff net", x: 350, y: 0, addresses: ["+99 laptops"] },
    { id: "router", kind: "router", label: "Router", x: 210, y: 110 },
    { id: "exam", kind: "server", label: "Exam net", x: 70, y: 220, addresses: ["1 server"] },
    { id: "guests", kind: "phone", label: "Guest net", x: 350, y: 220, addresses: ["499 phones"] },
  ],
  links: [
    { from: "laptop", to: "staff" },
    { from: "staff", to: "router" },
    { from: "router", to: "exam" },
    { from: "router", to: "guests" },
  ],
  tables: [{ id: "heard", title: "Who hears the request", device: "router", columns: ["Group", "Hears it"], rows: [] }],
  steps: [
    {
      caption: "Now there are three networks joined by a router. The same laptop sends the same request.",
      highlight: { devices: ["laptop"] },
    },
    {
      caption: "The laptop broadcasts on the staff network: who has 10.0.0.9?",
      packet: { at: 0, fields: REQUEST },
      highlight: { devices: ["laptop"] },
    },
    {
      caption: "The staff network floods it. The other 99 staff laptops hear it.",
      tableUpdates: [{ table: "heard", row: 0, cells: ["Other staff", "99"] }],
      highlight: { devices: ["staff"], rows: [{ table: "heard", row: 0 }] },
    },
    {
      caption: "The request reaches the router's staff side. The router does not pass it on.",
      packet: { at: 1, fields: REQUEST },
      tableUpdates: [
        { table: "heard", row: 1, cells: ["Exam server", "0"] },
        { table: "heard", row: 2, cells: ["Guest phones", "0"] },
      ],
      highlight: { devices: ["router"] },
      pick: {
        prompt: "The request reaches the router. Does the router send it on to the guests and the exam server?",
        options: [
          { label: "Yes, to both networks", correct: false, why: "A router joins networks, but a local broadcast like ARP stays on the network it started on." },
          { label: "No, a broadcast stays local", correct: true, why: "An ARP request is only for the local network. The router does not forward it." },
          { label: "Only to the exam server", correct: false, why: "The router forwards no local broadcast at all, to any network." },
        ],
      },
    },
    {
      caption: "Only 99 devices heard it, not 599. The same request reached 500 fewer devices.",
      tableUpdates: [{ table: "heard", row: 3, cells: ["Total heard", "99"] }],
      highlight: { rows: [{ table: "heard", row: 3 }] },
      verdict: { text: "99 heard it, not 599", tone: "good" },
    },
  ],
};

function SplitBroadcastBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM3SplitBroadcastData });
}

export const netM3SplitBroadcast: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: SplitBroadcastBeat,
};
