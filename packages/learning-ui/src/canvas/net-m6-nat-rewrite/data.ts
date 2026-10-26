import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 6.2 beat 1: a packet from the laptop (192.168.1.23, source port 41000) to the
// server (203.0.113.80, port 8080) crosses a Linux router doing masquerade. On
// the outside link the source address is the router's outside address
// (203.0.113.1); the source port is kept (nothing else uses it); the
// destination does not change; the TTL goes from 64 to 63 (TTL 64 at the
// sender, minus one per router). Tested behaviour: the address is rewritten and
// the port is kept (dossier 5.6). The renderer is NetStepCanvas; the model is
// models/net-step.ts.
const TITLE = "The router rewrites the source";
const PURPOSE = "A packet from the laptop crosses the router. Look at its fields before and after: only the source address and the TTL change.";
const LIMITS =
  "One laptop, one router and one server, with made-up addresses; the outside address 203.0.113.1 comes from a range kept for examples. This is how a Linux router with a masquerade rule behaves, as tested in the course lab. Other routers may differ. The source port is kept here only because no other conversation uses it.";

const FIELDS = (src: string, ttl: string, changed: boolean) => [
  { label: "src IP", value: src, ...(changed ? { changed: true } : {}) },
  { label: "src port", value: "41000" },
  { label: "dst IP", value: "203.0.113.80" },
  { label: "dst port", value: "8080" },
  { label: "TTL", value: ttl, ...(changed ? { changed: true } : {}) },
];

export const netM6NatRewriteData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "laptop", kind: "host", label: "Laptop", x: 70, y: 110, addresses: ["192.168.1.23"] },
    { id: "router", kind: "router", label: "Router", x: 210, y: 0, addresses: ["192.168.1.1", "203.0.113.1"] },
    { id: "server", kind: "server", label: "Server", x: 350, y: 110, addresses: ["203.0.113.80"] },
  ],
  links: [
    { from: "laptop", to: "router" },
    { from: "router", to: "server" },
  ],
  steps: [
    {
      caption: "The laptop sends a packet to the server. It leaves with the laptop's private address as the source.",
      packet: { at: 0, fields: FIELDS("192.168.1.23", "64", false) },
      highlight: { devices: ["laptop"] },
    },
    {
      caption: "The router rewrites the source address. The port stays the same.",
      packet: { at: 1, fields: FIELDS("203.0.113.1", "63", true) },
      highlight: { devices: ["router"] },
      pick: {
        prompt: "The packet reaches the router and leaves toward the server. Which source address does it carry?",
        options: [
          { label: "192.168.1.23, still the laptop", correct: false, why: "The server could not answer a private address. The router replaced it." },
          { label: "203.0.113.80, the server's own", correct: false, why: "That is the destination. A packet never names its receiver as its sender." },
          { label: "203.0.113.1, router outside", correct: true, why: "The router puts its outside address on every packet that leaves that way." },
        ],
      },
    },
    {
      caption: "Only the source address and the TTL changed. The destination is the same, so the server answers the router.",
      highlight: { devices: ["server"] },
      verdict: { text: "Source rewritten, port kept", tone: "good" },
    },
  ],
};

function NatRewriteBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM6NatRewriteData });
}

export const netM6NatRewrite: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: NatRewriteBeat,
};
