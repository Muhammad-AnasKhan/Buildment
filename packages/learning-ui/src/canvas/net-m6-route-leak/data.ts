import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 6.3 beat 3: the outside server (203.0.113.80) has no route to 192.168.1.0/24,
// so a request to the laptop (192.168.1.23) fails at once (curl exit 7). Give
// it a route, 192.168.1.0/24 via the router (203.0.113.1), and the connection
// to the laptop succeeds: a masquerade-only router is not a firewall, and the
// internet is kept out only because it has no route to private ranges. Both
// effects were tested in the course lab (dossier 5.6). The packet is not
// rewritten on the way in: the masquerade rule acts on packets that leave by
// the outside plug (oifname "veth-rout", recorded ruleset), and this one
// leaves by the inside. TTL goes from 64 to 63 at the router. Addresses are
// made up (private at home, documentation range outside). The renderer is
// NetStepCanvas; the model is models/net-step.ts.
const TITLE = "With a route, the outside gets in";
const PURPOSE = "Give the outside server a route to the home range and a packet addressed straight to the laptop reaches it. NAT alone blocks nothing.";
const LIMITS =
  "One server, one router and one laptop with made-up addresses; 203.0.113.80 and 203.0.113.1 come from a range kept for examples. The router has a masquerade rule and nothing else, as in the lab. A real router may add a filter of its own, and the real internet has no such route to a private range. The routes table is a model view of what ip route lists.";

const PACKET = (ttl: string, changed: boolean) => [
  { label: "src IP", value: "203.0.113.80" },
  { label: "dst IP", value: "192.168.1.23" },
  { label: "TTL", value: ttl, ...(changed ? { changed: true } : {}) },
];

export const netM6RouteLeakData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "server", kind: "server", label: "Server", x: 70, y: 110, addresses: ["203.0.113.80"] },
    { id: "router", kind: "router", label: "Router", x: 210, y: 0, addresses: ["203.0.113.1", "192.168.1.1"] },
    { id: "laptop", kind: "host", label: "Laptop", x: 350, y: 110, addresses: ["192.168.1.23"] },
  ],
  links: [
    { from: "server", to: "router" },
    { from: "router", to: "laptop" },
  ],
  tables: [{ id: "routes", title: "The server's routes", device: "server", columns: ["Destination", "Next hop"], rows: [["203.0.113.0/24", "direct"]] }],
  steps: [
    {
      caption: "The server has no route to 192.168.1.0/24. A request to 192.168.1.23 fails at once.",
      highlight: { devices: ["server"], rows: [{ table: "routes", row: 0 }] },
      verdict: { text: "No route: it fails at once", tone: "warn" },
    },
    {
      caption: "Give the server a route: 192.168.1.0/24 goes via 203.0.113.1, the router.",
      tableUpdates: [{ table: "routes", row: 1, cells: ["192.168.1.0/24", "203.0.113.1"] }],
      highlight: { rows: [{ table: "routes", row: 1 }] },
    },
    {
      caption: "The server sends a packet straight to 192.168.1.23. Masquerade only acts on packets leaving by the outside plug.",
      packet: { at: 0, fields: PACKET("64", false) },
      highlight: { devices: ["server"], rows: [{ table: "routes", row: 1 }] },
    },
    {
      caption: "The router forwards it, as it forwards any packet it has a route for. The laptop receives it.",
      packet: { at: 1, fields: PACKET("63", true) },
      highlight: { devices: ["laptop"] },
      verdict: { text: "A route alone let it in", tone: "warn" },
      pick: {
        prompt: "The router forwards the packet inside. Which source address does the laptop see on it?",
        options: [
          { label: "203.0.113.1, the router", correct: false, why: "The masquerade rule rewrites packets that leave by the outside plug. This one leaves by the inside." },
          { label: "203.0.113.80, the server", correct: true, why: "Nobody rewrote it. The router only lowered the TTL and passed it on." },
          { label: "192.168.1.1, router inside", correct: false, why: "The router did not touch the source address. It only forwarded the packet." },
        ],
      },
    },
  ],
};

function RouteLeakBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM6RouteLeakData });
}

export const netM6RouteLeak: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: RouteLeakBeat,
};
