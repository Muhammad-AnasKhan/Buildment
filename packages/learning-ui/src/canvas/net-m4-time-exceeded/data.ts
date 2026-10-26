import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 4.4 beat 2: the laptop sends a probe to 203.0.113.80 with TTL 1. R1 lowers
// the TTL to 0 and must discard the probe, and a router that discards a unicast
// packet for this reason must send ICMP Time Exceeded to the sender. The reply
// comes from R1's own address on the laptop's side, 192.168.1.1, and that source
// address is how the laptop learns who stopped the probe. The path is laptop,
// R1, R2, server, with no NAT. Addresses are made up: private ranges, and
// documentation ranges for public addresses. The renderer is NetStepCanvas;
// the model is models/net-step.ts.
const TITLE = "At zero the router reports back";
const PURPOSE = "The router that discards a packet at TTL 0 sends an ICMP Time Exceeded message to the sender. The reply comes from the router's own address.";
const LIMITS =
  "Made-up devices on one path of two routers, IPv4 only, no NAT. One probe with TTL 1 and the reply to it. Real routers can limit how many such replies they send, and some send none; the picture shows the usual case. IPv6 has a similar counter, the hop limit, which is not drawn here.";

export const netM4TimeExceededData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "laptop", kind: "host", label: "Laptop", x: 70, y: 0, addresses: ["192.168.1.23"] },
    { id: "r1", kind: "router", label: "R1", x: 350, y: 0, addresses: ["192.168.1.1", "198.51.100.2"] },
    { id: "r2", kind: "router", label: "R2", x: 350, y: 110, addresses: ["198.51.100.1", "203.0.113.1"] },
    { id: "server", kind: "server", label: "Server", x: 70, y: 110, addresses: ["203.0.113.80"] },
  ],
  links: [
    { from: "laptop", to: "r1" },
    { from: "r1", to: "r2" },
    { from: "r2", to: "server" },
  ],
  steps: [
    {
      caption: "The laptop sends a probe to 203.0.113.80 with TTL 1.",
      packet: {
        at: 0,
        fields: [
          { label: "src IP", value: "192.168.1.23" },
          { label: "dst IP", value: "203.0.113.80" },
          { label: "TTL", value: "1" },
        ],
      },
      highlight: { devices: ["laptop"] },
    },
    {
      caption: "R1 lowers the TTL to 0. It must discard the probe, so the probe goes no further.",
      highlight: { devices: ["r1"] },
    },
    {
      caption: "R1 sends an ICMP Time Exceeded message to the laptop. Its source is R1's own address.",
      packet: {
        at: 0,
        reverse: true,
        fields: [
          { label: "src IP", value: "192.168.1.1", changed: true },
          { label: "dst IP", value: "192.168.1.23", changed: true },
          { label: "ICMP", value: "Time Exceeded", changed: true },
        ],
      },
      highlight: { devices: ["r1"] },
      pick: {
        prompt: "R1 has discarded the probe. Who does it tell?",
        options: [
          { label: "Nobody: it drops it silently", correct: false, why: "A router must report this drop. Silence is a choice an operator makes, not the normal rule." },
          { label: "The server at 203.0.113.80", correct: false, why: "The server never saw the probe. The sender is the one who needs the news." },
          { label: "The laptop, from R1's own IP", correct: true, why: "The probe's source address is the laptop. R1 tells it, and signs the message with its own address." },
        ],
      },
    },
    {
      caption: "The laptop reads the source of the reply, 192.168.1.1. That is how it learns who stopped the probe.",
      highlight: { devices: ["laptop"] },
      verdict: { text: "The reply names the router", tone: "good" },
    },
  ],
};

function TimeExceededBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM4TimeExceededData });
}

export const netM4TimeExceeded: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: TimeExceededBeat,
};
