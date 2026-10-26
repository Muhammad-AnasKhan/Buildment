import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 4.2 beat 2: the laptop (192.168.1.23) sends to a far server (203.0.113.80).
// The mask test says "not on my network", the default route names the gateway
// R1 (192.168.1.1), and ARP can only ask the local link, so the laptop asks for
// R1's MAC. The frame carries the server's IP address but R1's MAC. The path is
// laptop, R1, R2, server with no NAT. The devices, addresses and MACs are made
// up (locally administered, 02:...); public addresses come from the
// documentation ranges. The renderer is NetStepCanvas; the model is
// models/net-step.ts.
const TITLE = "A far site gets the router's MAC";
const PURPOSE = "The laptop sends to a server on another network. The frame carries the server's IP address but the MAC of R1, the gateway.";
const LIMITS =
  "Made-up devices and MACs on Ethernet links, IPv4 only, two routers, no NAT. Only the first link is drawn in detail: the next beat follows the packet all the way. The table is a simplified view of the laptop's ARP cache. Wi-Fi frames look different.";

const LAPTOP_MAC = "02:00:00:00:01:23";
const R1_INSIDE_MAC = "02:00:00:00:01:01";

export const netM4MacRemoteData: NetStepData = {
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
  tables: [{ id: "arp", title: "Laptop's ARP table", device: "laptop", columns: ["IP address", "MAC address"], rows: [] }],
  steps: [
    {
      caption: "The laptop sends to the server at 203.0.113.80. The mask says: not on my network.",
      highlight: { devices: ["laptop", "server"] },
    },
    {
      caption: "Its default route says: hand it to the gateway, R1 at 192.168.1.1. ARP can only ask this link.",
      highlight: { devices: ["r1"], links: [0] },
    },
    {
      caption: "So the laptop asks the link for R1's MAC. R1 answers, and the laptop saves it.",
      tableUpdates: [{ table: "arp", row: 0, cells: ["192.168.1.1", R1_INSIDE_MAC] }],
      highlight: { devices: ["r1"], rows: [{ table: "arp", row: 0 }] },
    },
    {
      caption: "The frame carries the server's IP address but R1's MAC. R1 will forward it.",
      packet: {
        at: 0,
        fields: [
          { label: "src MAC", value: LAPTOP_MAC },
          { label: "dst MAC", value: R1_INSIDE_MAC },
          { label: "src IP", value: "192.168.1.23" },
          { label: "dst IP", value: "203.0.113.80" },
        ],
      },
      highlight: { links: [0], rows: [{ table: "arp", row: 0 }] },
      verdict: { text: "Server's IP, but R1's MAC", tone: "accent" },
      pick: {
        prompt: "The laptop builds the frame for the server. Which destination MAC does it use?",
        options: [
          { label: "R1's MAC", correct: true, why: "R1 is the next device on this link. The frame goes to the gateway, and the server's address stays in the IP part." },
          { label: "The server's MAC", correct: false, why: "The laptop cannot ask the far server. ARP only reaches this link, and the server is not on it." },
          { label: "R2's MAC", correct: false, why: "R2 is not on the laptop's link either. A frame always goes to the next device on its own link." },
        ],
      },
    },
  ],
};

function MacRemoteBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM4MacRemoteData });
}

export const netM4MacRemote: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: MacRemoteBeat,
};
