import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 4.2 beat 1: the laptop (192.168.1.23) sends to a neighbour (192.168.1.40) on
// its own network. The mask test says "local", so no router is involved. The
// laptop asks the link for the neighbour's MAC with ARP, saves the answer, and
// puts that MAC in the destination field of the frame. The devices, addresses
// and MACs are made up (locally administered, 02:...). The ARP table is a model
// view of what ip neigh shows. The renderer is NetStepCanvas; the model is
// models/net-step.ts.
const TITLE = "A neighbour's frame carries the neighbour's MAC";
const PURPOSE = "The laptop sends to a neighbour on its own network. It saves the neighbour's MAC from ARP and puts that MAC in the frame.";
const LIMITS =
  "Made-up devices and MACs on one Ethernet link, IPv4 only, no NAT. The table is a simplified view of the laptop's ARP cache, which ip neigh shows for real. The ARP exchange itself is not drawn: chapter 3.3 shows it. Wi-Fi frames look different.";

const LAPTOP_MAC = "02:00:00:00:01:23";
const NEIGHBOUR_MAC = "02:00:00:00:01:40";

const FRAME = [
  { label: "src MAC", value: LAPTOP_MAC },
  { label: "dst MAC", value: NEIGHBOUR_MAC },
  { label: "src IP", value: "192.168.1.23" },
  { label: "dst IP", value: "192.168.1.40" },
];

export const netM4MacLocalData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "laptop", kind: "host", label: "Laptop", x: 70, y: 0, addresses: ["192.168.1.23"] },
    { id: "switch", kind: "switch", label: "Switch", x: 210, y: 100 },
    { id: "neighbour", kind: "host", label: "Neighbour", x: 350, y: 0, addresses: ["192.168.1.40"] },
    { id: "r1", kind: "router", label: "R1", x: 210, y: 200, addresses: ["192.168.1.1"] },
  ],
  links: [
    { from: "laptop", to: "switch" },
    { from: "switch", to: "neighbour" },
    { from: "switch", to: "r1" },
  ],
  tables: [{ id: "arp", title: "Laptop's ARP table", device: "laptop", columns: ["IP address", "MAC address"], rows: [] }],
  steps: [
    {
      caption: "The laptop sends to its neighbour at 192.168.1.40. The mask says: same network, so no router is needed.",
      highlight: { devices: ["laptop", "neighbour"] },
    },
    {
      caption: "It needs the neighbour's MAC. It asks the link with ARP, the neighbour answers, and the laptop saves the answer.",
      tableUpdates: [{ table: "arp", row: 0, cells: ["192.168.1.40", NEIGHBOUR_MAC] }],
      highlight: { devices: ["neighbour"], rows: [{ table: "arp", row: 0 }] },
    },
    {
      caption: "The frame leaves with the neighbour's MAC as its destination MAC. The destination IP is the neighbour's too.",
      packet: { at: 0, fields: FRAME },
      highlight: { links: [0], rows: [{ table: "arp", row: 0 }] },
      pick: {
        prompt: "The laptop builds the frame. Which MAC goes in the destination field?",
        options: [
          { label: "The router's MAC", correct: false, why: "The router is for destinations off this network. The mask says the neighbour is on it." },
          { label: "The neighbour's MAC", correct: true, why: "The neighbour is on this network, so the frame goes straight to it, with the MAC from the ARP table." },
          { label: "ff:ff:ff:ff:ff:ff, everyone", correct: false, why: "A broadcast is for the ARP question. The data frame goes to one MAC." },
        ],
      },
    },
    {
      caption: "The switch passes the frame on unchanged. The router is not involved.",
      packet: { at: 1, fields: FRAME },
      highlight: { devices: ["neighbour"] },
      verdict: { text: "Neighbour's IP, neighbour's MAC", tone: "good" },
    },
  ],
};

function MacLocalBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM4MacLocalData });
}

export const netM4MacLocal: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: MacLocalBeat,
};
