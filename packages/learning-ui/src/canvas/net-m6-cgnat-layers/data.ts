import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 6.4 beat 2: a packet from the laptop (192.168.1.23) crosses two NAT routers.
// The home router rewrites the source to its outside address, 100.72.14.9, an
// address in 100.64.0.0/10, the shared address space for provider networks
// [S11]. The provider's router (carrier-grade NAT) rewrites it again, to the
// public address 203.0.113.45, so the server logs 203.0.113.45 and never sees
// the two addresses before it. The shared and public addresses are stand-ins:
// 100.72.14.9 is in the shared block and 203.0.113.45 comes from a
// documentation range. One provider layer only. The renderer is
// NetStepCanvas; the model is models/net-step.ts.
const TITLE = "Two routers rewrite the source";
const PURPOSE = "The packet's source address changes at the home router and again at the provider's router.";
const LIMITS =
  "One provider layer, with no port limits shown. A real provider may run more than one layer, and the packet also changes its source port when ports clash, which is not drawn. 100.72.14.9 is an example from the shared address space for providers [S11]; 203.0.113.45 is a stand-in for a public address from a range kept for examples. The table is a model view of the packet's source at each stage.";

const PACKET = (src: string, changed: boolean) => [
  { label: "src IP", value: src, ...(changed ? { changed: true } : {}) },
  { label: "dst IP", value: "203.0.113.80" },
];

export const netM6CgnatLayersData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "laptop", kind: "host", label: "Laptop", x: 70, y: 90, addresses: ["192.168.1.23"] },
    { id: "home", kind: "router", label: "Home NAT", x: 210, y: 0, addresses: ["100.72.14.9"] },
    { id: "provider", kind: "cloud", label: "Provider", x: 350, y: 90, addresses: ["203.0.113.45"] },
    { id: "server", kind: "server", label: "Server", x: 210, y: 180, addresses: ["203.0.113.80"] },
  ],
  links: [
    { from: "laptop", to: "home" },
    { from: "home", to: "provider" },
    { from: "provider", to: "server" },
  ],
  tables: [{ id: "stages", title: "Source address at each stage", device: "home", columns: ["Stage", "Source"], rows: [] }],
  steps: [
    {
      caption: "The laptop sends a packet to the server. Its source is its private address.",
      packet: { at: 0, fields: PACKET("192.168.1.23", false) },
      tableUpdates: [{ table: "stages", row: 0, cells: ["Laptop sends", "192.168.1.23"] }],
      highlight: { devices: ["laptop"], rows: [{ table: "stages", row: 0 }] },
    },
    {
      caption: "The home router does NAT. The packet leaves it with the router's outside address.",
      packet: { at: 1, fields: PACKET("100.72.14.9", true) },
      tableUpdates: [{ table: "stages", row: 1, cells: ["After home router", "100.72.14.9"] }],
      highlight: { devices: ["home"], rows: [{ table: "stages", row: 1 }] },
      pick: {
        prompt: "The packet leaves the home router. Which source address does it carry now?",
        options: [
          { label: "203.0.113.45, the public one", correct: false, why: "That address belongs to the provider's router. The packet has not reached it yet." },
          { label: "100.72.14.9, router outside", correct: true, why: "The home router puts its own outside address on the packet. Here that address is a shared one." },
          { label: "192.168.1.1, router inside", correct: false, why: "That is the router's inside address. NAT replaces the source with the outside one." },
        ],
      },
    },
    {
      caption: "The provider's router does NAT too. It rewrites the source a second time.",
      packet: { at: 2, fields: PACKET("203.0.113.45", true) },
      tableUpdates: [{ table: "stages", row: 2, cells: ["After provider NAT", "203.0.113.45"] }],
      highlight: { devices: ["provider"], rows: [{ table: "stages", row: 2 }] },
    },
    {
      caption: "The server logs 203.0.113.45. It never sees 192.168.1.23 or 100.72.14.9.",
      highlight: { devices: ["server"] },
      verdict: { text: "Source rewritten twice", tone: "accent" },
    },
  ],
};

function CgnatLayersBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM6CgnatLayersData });
}

export const netM6CgnatLayers: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: CgnatLayersBeat,
};
