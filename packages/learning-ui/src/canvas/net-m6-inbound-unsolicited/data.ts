import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 6.3 beat 1: a friend (198.51.100.77) sends a packet to the router's outside
// address (203.0.113.1), port 8080, and the laptop has never sent anything. The
// NAT table is empty and there is no forwarding rule, so the router has no row
// to translate the packet with and nobody to hand it to. Nothing on the router
// listens on port 8080, so it answers connection refused at once. Tested
// effect (dossier 5.6): the server to the router's outside address, port 22,
// nothing listening, was refused (curl exit 7), not a silent timeout. The
// devices and addresses are made up (documentation ranges outside). The
// renderer is NetStepCanvas; the model is models/net-step.ts.
const TITLE = "A friend types your public address";
const PURPOSE = "A friend's packet reaches the router's outside address. Your laptop never sent anything first, so the NAT table is empty.";
const LIMITS =
  "One friend, one router and one laptop with made-up addresses; 198.51.100.77 and 203.0.113.1 come from ranges kept for examples. This router has no forwarding rule and no filter. The answer connection refused is what the lab router gave in a test; a router that drops silently would leave the friend waiting for a timeout instead.";

const INBOUND = [
  { label: "src", value: "198.51.100.77:50000" },
  { label: "dst", value: "203.0.113.1:8080" },
];

export const netM6InboundUnsolicitedData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "friend", kind: "host", label: "Friend", x: 70, y: 110 },
    { id: "router", kind: "router", label: "Router", x: 210, y: 0, addresses: ["203.0.113.1", "192.168.1.1"] },
    { id: "laptop", kind: "host", label: "Laptop", x: 350, y: 110, addresses: ["192.168.1.23"] },
  ],
  links: [
    { from: "friend", to: "router" },
    { from: "router", to: "laptop" },
  ],
  tables: [{ id: "nat", title: "The router's NAT table", device: "router", columns: ["Inside", "Outside"], rows: [] }],
  steps: [
    {
      caption: "Your friend types your public address. Your laptop has sent nothing, so the NAT table is empty.",
      highlight: { devices: ["friend"] },
    },
    {
      caption: "The friend's packet reaches the router's outside address, port 8080.",
      packet: { at: 0, fields: INBOUND },
      highlight: { devices: ["router"] },
      pick: {
        prompt: "The packet is for the router's outside address and the table is empty. Where can the router send it?",
        options: [
          { label: "To the laptop, the only device", correct: false, why: "No row says the packet belongs to the laptop. With ten devices the router could not guess either." },
          { label: "To any device it picks", correct: false, why: "A router never picks at random. A wrong guess would send data to the wrong device." },
          { label: "Nowhere: no row names a device", correct: true, why: "Without a row, the router cannot tell which device the packet is for, so it has nobody to give it to." },
        ],
      },
    },
    {
      caption: "No row to translate it and no rule to forward it. The router has nobody to give it to.",
      highlight: { devices: ["router"] },
    },
    {
      caption: "The router answers for itself: connection refused. The laptop never sees the packet.",
      packet: { at: 0, reverse: true, fields: [{ label: "answer", value: "connection refused" }] },
      highlight: { devices: ["friend"] },
      verdict: { text: "No row, no rule: refused", tone: "bad" },
    },
  ],
};

function InboundUnsolicitedBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM6InboundUnsolicitedData });
}

export const netM6InboundUnsolicited: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: InboundUnsolicitedBeat,
};
