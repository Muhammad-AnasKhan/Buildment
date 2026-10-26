import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 6.3 beat 4: one forwarding rule opens one port. A request to the router's
// outside address 203.0.113.1, port 8080, is sent on to the laptop's web server
// at 192.168.1.23, port 80: the router rewrites the destination (address and
// port) and leaves the source alone. Port 22 has no rule and nothing listens
// on it, so it is refused at once. Tested effects (dossier 5.6 and the part 2
// recording): the forward worked from the outside namespace; an unforwarded
// port gave connection refused (curl exit 7); the recorded rule is
// iifname "veth-rout" tcp dport 8080 dnat to 192.168.1.23:80. The friend's
// address 198.51.100.77 is from a documentation range. The renderer is
// NetStepCanvas; the model is models/net-step.ts.
const TITLE = "A forwarding rule opens one port";
const PURPOSE = "One rule sends port 8080 on the router to the laptop's web server. Port 22 has no rule and stays refused.";
const LIMITS =
  "One friend, one router and one laptop with made-up addresses; 198.51.100.77 and 203.0.113.1 come from ranges kept for examples. The table is a model view of one rule, not the router's real rule text (6.8 builds that). The router has no filter, so the forward rule is the only thing that opens a port. The refusal on port 22 is what the lab router gave when nothing listened there.";

const SRC = { label: "src", value: "198.51.100.77:50000" };

export const netM6ForwardRuleData: NetStepData = {
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
  tables: [{ id: "fwd", title: "The router's forward rules", device: "router", columns: ["Arrives at", "Goes to"], rows: [] }],
  steps: [
    {
      caption: "The router has no forwarding rule yet. A request to port 8080 would be refused.",
      highlight: { devices: ["router"] },
    },
    {
      caption: "Add one rule: what arrives at 203.0.113.1:8080 goes to 192.168.1.23:80.",
      tableUpdates: [{ table: "fwd", row: 0, cells: ["203.0.113.1:8080", "192.168.1.23:80"] }],
      highlight: { rows: [{ table: "fwd", row: 0 }] },
    },
    {
      caption: "The friend asks 203.0.113.1, port 8080. The packet reaches the router.",
      packet: { at: 0, fields: [SRC, { label: "dst", value: "203.0.113.1:8080" }] },
      highlight: { devices: ["friend"] },
    },
    {
      caption: "The router rewrites the destination to the laptop. The source stays the friend's.",
      packet: { at: 1, fields: [SRC, { label: "dst", value: "192.168.1.23:80", changed: true }] },
      highlight: { devices: ["laptop"], rows: [{ table: "fwd", row: 0 }] },
    },
    {
      caption: "Now the friend asks port 22 on the same address. No rule matches, and nothing listens there.",
      packet: { at: 0, reverse: true, fields: [{ label: "answer", value: "connection refused" }] },
      highlight: { devices: ["router"] },
      verdict: { text: "Port 8080 is open. Port 22 is not.", tone: "good" },
      pick: {
        prompt: "Now the friend asks port 22 on the same address. No rule matches. What happens?",
        options: [
          { label: "It is refused at once", correct: true, why: "Nothing listens on port 22 at the router, so it answers refused at once, not after a timeout." },
          { label: "It reaches the laptop too", correct: false, why: "Only port 8080 has a rule. A forwarding rule opens one port, not the whole laptop." },
          { label: "It hangs until it times out", correct: false, why: "In the lab test an unforwarded port was refused at once (curl exit 7), not a timeout." },
        ],
      },
    },
  ],
};

function ForwardRuleBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM6ForwardRuleData });
}

export const netM6ForwardRule: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: ForwardRuleBeat,
};
