import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 4.3 beat 7: ip route get asks the system which row it would use for a
// destination. The two answers in the captions are copied, character for
// character, from the capstone's reference run recorded in the course lab
// (session capstone-1 in recordings/replay-sessions.txt): home1 asking about
// 203.0.113.80 answers "via 192.168.1.1 dev veth-home1 src 192.168.1.30", and
// hrouter asking the same question answers "via 198.51.100.1 dev veth-hout src
// 198.51.100.2". The table collects the via and dev parts of the answers.
// Addresses are the capstone's: private ranges, and documentation ranges for
// the provider and the server. The renderer is NetStepCanvas; the model is
// models/net-step.ts.
const TITLE = "Ask the system: ip route get";
const PURPOSE = "ip route get shows which row the system would use for a destination. Each machine answers for itself with its own next hop.";
const LIMITS =
  "Two recorded answers from the course lab's capstone run, with the machines named home1 and hrouter as in that run. The table only collects the via and dev parts of the answers. The model has no commands to type: in the lab you run ip route get yourself. The path beyond prouter is drawn as one link.";

export const netM4RouteGetData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "home1", kind: "host", label: "home1", x: 70, y: 0, addresses: ["192.168.1.30"] },
    { id: "hrouter", kind: "router", label: "hrouter", x: 350, y: 0, addresses: ["192.168.1.1", "198.51.100.2"] },
    { id: "prouter", kind: "router", label: "prouter", x: 350, y: 110, addresses: ["198.51.100.1", "203.0.113.1"] },
    { id: "server", kind: "server", label: "server", x: 70, y: 110, addresses: ["203.0.113.80"] },
  ],
  links: [
    { from: "home1", to: "hrouter" },
    { from: "hrouter", to: "prouter" },
    { from: "prouter", to: "server" },
  ],
  tables: [{ id: "answers", title: "Answers to ip route get", device: "home1", columns: ["Asked on", "via", "dev"], rows: [] }],
  steps: [
    {
      caption: "On home1 you type ip route get 203.0.113.80. The system names the row it would use.",
      highlight: { devices: ["home1"] },
    },
    {
      caption: "home1 prints: 203.0.113.80 via 192.168.1.1 dev veth-home1 src 192.168.1.30 uid 0",
      tableUpdates: [{ table: "answers", row: 0, cells: ["home1", "192.168.1.1", "veth-home1"] }],
      highlight: { devices: ["hrouter"], links: [0], rows: [{ table: "answers", row: 0 }] },
    },
    {
      caption: "hrouter prints: 203.0.113.80 via 198.51.100.1 dev veth-hout src 198.51.100.2 uid 0",
      tableUpdates: [{ table: "answers", row: 1, cells: ["hrouter", "198.51.100.1", "veth-hout"] }],
      highlight: { devices: ["prouter"], links: [1], rows: [{ table: "answers", row: 1 }] },
      pick: {
        prompt: "Now type the same command on hrouter. What is its next hop for 203.0.113.80?",
        options: [
          { label: "prouter, 198.51.100.1", correct: true, why: "hrouter is not plugged into the server's network. It hands the packet to prouter, which is." },
          { label: "home1, 192.168.1.30", correct: false, why: "home1 is where the packet came from. A router never sends it back toward its source." },
          { label: "The server, 203.0.113.80", correct: false, why: "A next hop must be on a link hrouter has. The server is two links away." },
        ],
      },
    },
    {
      caption: "via is the next hop, dev is the plug to use, and src is the machine's own address there.",
      highlight: { rows: [{ table: "answers", row: 0 }, { table: "answers", row: 1 }] },
      verdict: { text: "Each machine names its own next hop", tone: "good" },
    },
  ],
};

function RouteGetBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM4RouteGetData });
}

export const netM4RouteGet: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: RouteGetBeat,
};
