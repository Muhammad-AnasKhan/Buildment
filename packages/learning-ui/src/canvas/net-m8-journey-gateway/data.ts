import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 8.1 beat 4 (steps 4 and 5 of the journey): 203.0.113.80 is outside
// 192.168.1.0/24, so home1 sends the SYN to its gateway. The packet keeps the
// server's IP address as destination but carries the router's MAC, which home1
// already holds in its ARP table from the previous beat. The server's MAC never
// appears on this link; it is two routers away. The route table is a model view
// of ip route (the lease gives a default route via 192.168.1.1 and a connected
// route for 192.168.1.0/24). The
// renderer is NetStepCanvas; the model is models/net-step.ts.
const TITLE = "Off my subnet: use the gateway";
const PURPOSE = "203.0.113.80 is outside home1's subnet, so the SYN goes to the gateway. It carries the server's IP and the router's MAC.";
const LIMITS =
  "Four made-up devices and made-up MACs. The tables are simplified views of ip route and ip neigh. Only the first link is played in this beat. One packet at a time, plain TCP, no loss.";

const HOME1_IP = "192.168.1.101";
const ROUTER_MAC = "02:00:00:00:00:01";

export const netM8JourneyGatewayData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "home1", kind: "host", label: "home1", x: 70, y: 0 },
    { id: "hrouter", kind: "router", label: "hrouter", x: 350, y: 0, addresses: ["192.168.1.1", "198.51.100.2"] },
    { id: "prouter", kind: "router", label: "prouter", x: 350, y: 110, addresses: ["198.51.100.1", "203.0.113.1"] },
    { id: "server", kind: "server", label: "server", x: 70, y: 110, addresses: ["203.0.113.80"] },
  ],
  links: [
    { from: "home1", to: "hrouter" },
    { from: "hrouter", to: "prouter" },
    { from: "prouter", to: "server" },
  ],
  tables: [
    {
      id: "routes",
      title: "home1's route table",
      device: "home1",
      columns: ["Destination", "Via"],
      rows: [
        ["192.168.1.0/24", "direct"],
        ["default", "192.168.1.1"],
      ],
    },
    { id: "arp", title: "home1's ARP table", device: "home1", columns: ["IP address", "MAC address"], rows: [["192.168.1.1", ROUTER_MAC]] },
  ],
  steps: [
    {
      caption: "home1 wants to connect to 203.0.113.80. First question: is that address inside my own subnet, 192.168.1.0/24?",
      highlight: { devices: ["home1", "server"] },
    },
    {
      caption: "No. It is outside 192.168.1.0/24, so only the default row matches. The default row says: send it to the gateway.",
      highlight: { devices: ["home1"], rows: [{ table: "routes", row: 1 }] },
    },
    {
      caption: "The gateway is 192.168.1.1. home1 already knows its MAC from the last beat, so no new ARP is needed.",
      highlight: { devices: ["home1", "hrouter"], rows: [{ table: "arp", row: 0 }] },
    },
    {
      caption: "The SYN carries the server's IP address but the router's MAC address. The MAC only covers the next hop.",
      packet: {
        at: 0,
        fields: [
          { label: "src IP", value: HOME1_IP },
          { label: "dst IP", value: "203.0.113.80" },
          { label: "dst MAC", value: ROUTER_MAC },
          { label: "flags", value: "SYN" },
        ],
      },
      highlight: { devices: ["home1", "hrouter"], links: [0], rows: [{ table: "arp", row: 0 }] },
      verdict: { text: "Server's IP, router's MAC", tone: "accent" },
    },
    {
      caption: "No capture on this link will ever show the server's MAC. The server is two routers away.",
      highlight: { devices: ["server"], links: [1, 2] },
    },
  ],
};

function GatewayBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM8JourneyGatewayData });
}

export const netM8JourneyGateway: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: GatewayBeat,
};
