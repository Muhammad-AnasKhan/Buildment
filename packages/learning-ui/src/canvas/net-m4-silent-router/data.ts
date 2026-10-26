import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 4.4 beat 5: the same trace as the probes beat, but R2 is set to stay silent.
// It still forwards packets; it only sends no Time Exceeded reply. Probe 2 dies
// at R2 and nothing comes back, so line 2 shows * * *. Probe 3 passes through R2
// as usual and the server answers, so line 3 shows 203.0.113.80. Stars mean no
// answer came back, not that the path is broken. Addresses are made up: private
// ranges, and documentation ranges for public addresses. The renderer is
// NetStepCanvas; the model is models/net-step.ts.
const TITLE = "A silent router shows * * *";
const PURPOSE = "R2 is set to stay silent. Line 2 of the trace shows three stars, and line 3 still answers, because R2 still forwards.";
const LIMITS =
  "Made-up devices on one path of two routers, IPv4 only, no NAT. R2 is silent by setting; a filter that eats the probe or the reply gives the same stars and is not drawn. The table is a model view of the lines traceroute prints, with the times left out. The learner cannot switch R2 on and off: the picture shows the silent case.";

export const netM4SilentRouterData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "laptop", kind: "host", label: "Laptop", x: 70, y: 0, addresses: ["192.168.1.23"] },
    { id: "r1", kind: "router", label: "R1", x: 350, y: 0, addresses: ["192.168.1.1", "198.51.100.2"] },
    { id: "r2", kind: "router", label: "R2 silent", x: 350, y: 110, addresses: ["198.51.100.1", "203.0.113.1"] },
    { id: "server", kind: "server", label: "Server", x: 70, y: 110, addresses: ["203.0.113.80"] },
  ],
  links: [
    { from: "laptop", to: "r1" },
    { from: "r1", to: "r2" },
    { from: "r2", to: "server" },
  ],
  tables: [{ id: "trace", title: "The laptop's trace", device: "laptop", columns: ["Line", "Reply from"], rows: [] }],
  steps: [
    {
      caption: "R2 is set to stay silent: it will not send Time Exceeded. Traceroute runs as before.",
      highlight: { devices: ["r2"] },
    },
    {
      caption: "Probe 1 dies at R1, which replies from 192.168.1.1. Line 1 is filled.",
      packet: {
        at: 0,
        reverse: true,
        fields: [
          { label: "src IP", value: "192.168.1.1" },
          { label: "dst IP", value: "192.168.1.23" },
          { label: "ICMP", value: "Time Exceeded" },
        ],
      },
      tableUpdates: [{ table: "trace", row: 0, cells: ["1", "192.168.1.1"] }],
      highlight: { devices: ["r1"], rows: [{ table: "trace", row: 0 }] },
    },
    {
      caption: "Probe 2 dies at R2. R2 stays silent, so nothing comes back. Line 2 shows * * *.",
      tableUpdates: [{ table: "trace", row: 1, cells: ["2", "* * *"] }],
      highlight: { devices: ["r2"], rows: [{ table: "trace", row: 1 }] },
    },
    {
      caption: "Probe 3 passes through R2 as usual. The server answers, so line 3 shows 203.0.113.80.",
      packet: {
        at: 2,
        reverse: true,
        fields: [
          { label: "src IP", value: "203.0.113.80" },
          { label: "dst IP", value: "192.168.1.23" },
        ],
      },
      tableUpdates: [{ table: "trace", row: 2, cells: ["3", "203.0.113.80"] }],
      highlight: { devices: ["server"], rows: [{ table: "trace", row: 2 }] },
      verdict: { text: "Line 2 is stars, line 3 answers", tone: "accent" },
      pick: {
        prompt: "Line 2 shows * * *. Did probe 3 get past R2?",
        options: [
          { label: "No: the path is broken at R2", correct: false, why: "A broken path would stop every probe after it. A silent router only fails to speak." },
          { label: "Yes: R2 forwards it while silent", correct: true, why: "R2 only withholds its own Time Exceeded replies. It still passes other packets on." },
          { label: "Only if R2 is switched back on", correct: false, why: "The probe does not need R2 to speak. R2 forwards packets whether it replies or not." },
        ],
      },
    },
  ],
};

function SilentRouterBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM4SilentRouterData });
}

export const netM4SilentRouter: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: SilentRouterBeat,
};
