import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 6.3 beat 5: NAT rewrites addresses and filters nothing. A guest device
// (192.168.50.10) on its own network asks the laptop's page (192.168.1.23,
// port 80). With forwarding on and no filter, the router passes the packet
// between its two networks. One rule in the forward chain, from 192.168.50.0/24
// to 192.168.1.0/24, drop, stops it: the guest then gets no answer and the
// request times out. Tested effect (dossier 5.6 and the part 2 recording):
// guest to home blocked by a forward drop rule, guest to server works; the
// guest's request timed out (curl: (28) Connection timed out after 3002
// milliseconds). The recorded rule is
// ip saddr 192.168.50.0/24 ip daddr 192.168.1.0/24 drop. The step that passes
// the packet without a rule follows from forwarding being on and the chain
// accepting by default (policy accept in the recorded ruleset); the same
// forwarding let the outside server reach the laptop in net-m6-route-leak. The
// renderer is NetStepCanvas; the model is models/net-step.ts.
const TITLE = "A filter is a separate rule";
const PURPOSE = "NAT rewrites addresses but blocks nothing. One rule in the forward chain keeps the guest away from the home network.";
const LIMITS =
  "A guest, a router and a laptop with made-up private addresses. The router forwards between its networks and its forward chain accepts by default, as in the lab until you add the rule; the blocked case is the lab's tested guest rule. A real router may ship with filters of its own, so this says nothing about any particular router. The table is a model view of one rule, not the router's real rule text.";

const FIELDS = [
  { label: "src IP", value: "192.168.50.10" },
  { label: "dst IP", value: "192.168.1.23" },
  { label: "dst port", value: "80" },
];

export const netM6FilterRuleData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "guest", kind: "phone", label: "Guest", x: 70, y: 110 },
    { id: "router", kind: "router", label: "Router", x: 210, y: 0, addresses: ["192.168.50.1", "192.168.1.1"] },
    { id: "laptop", kind: "host", label: "Laptop", x: 350, y: 110, addresses: ["192.168.1.23"] },
  ],
  links: [
    { from: "guest", to: "router" },
    { from: "router", to: "laptop" },
  ],
  tables: [{ id: "rules", title: "The router's forward rules", device: "router", columns: ["From", "To", "Rule"], rows: [] }],
  steps: [
    {
      caption: "The guest is on its own network, 192.168.50.0/24. The router has NAT but no filter yet.",
      highlight: { devices: ["guest"] },
    },
    {
      caption: "The guest asks the laptop's page at 192.168.1.23. The packet reaches the router.",
      packet: { at: 0, fields: FIELDS },
      highlight: { devices: ["router"] },
      pick: {
        prompt: "The guest asks for the laptop's page. The router has NAT but no filter. What does it do?",
        options: [
          { label: "Blocks it: NAT is a firewall", correct: false, why: "NAT rewrites addresses. It does not decide who is allowed in. A filter rule does that." },
          { label: "Forwards it to the laptop", correct: true, why: "Forwarding is on and nothing says no, so the router passes packets between its networks." },
          { label: "Refuses it: private to private", correct: false, why: "Private addresses reach each other through a router that has routes. Nothing here refuses them." },
        ],
      },
    },
    {
      caption: "With no filter, the router forwards the packet to the laptop.",
      packet: { at: 1, fields: FIELDS },
      highlight: { devices: ["laptop"] },
      verdict: { text: "No filter: it gets through", tone: "warn" },
    },
    {
      caption: "Add one rule to the forward chain: from 192.168.50.0/24 to 192.168.1.0/24, drop.",
      tableUpdates: [{ table: "rules", row: 0, cells: ["192.168.50.0/24", "192.168.1.0/24", "drop"] }],
      highlight: { rows: [{ table: "rules", row: 0 }] },
    },
    {
      caption: "The guest asks again. The router drops the packet and says nothing. The request times out.",
      packet: { at: 0, fields: FIELDS },
      highlight: { devices: ["router"], rows: [{ table: "rules", row: 0 }] },
      verdict: { text: "Dropped: the guest times out", tone: "good" },
    },
  ],
};

function FilterRuleBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM6FilterRuleData });
}

export const netM6FilterRule: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: FilterRuleBeat,
};
