import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 3.3 (and 3.4): an ARP exchange on one link. The laptop knows the phone's IP
// address but not its MAC, so it broadcasts an ARP request to
// ff:ff:ff:ff:ff:ff; the switch floods it; only the phone owns the address and
// answers by unicast; the laptop saves the answer in its ARP table. The
// devices, addresses and MACs are made up (locally administered, 02:...). The
// field order and words follow the real ARP request recorded in the lab
// (cable-capture.txt: Request who-has 192.168.1.20 tell 192.168.1.10, sent to
// ff:ff:ff:ff:ff:ff). The renderer is NetStepCanvas; the model is
// models/net-step.ts.
const TITLE = "One broadcast finds a MAC";
const PURPOSE = "The laptop asks the whole link who has 192.168.1.20. The phone answers, and the laptop saves the answer in its ARP table.";
const LIMITS =
  "Two made-up devices and made-up MACs on one switch. The table is a simplified view of the laptop's ARP cache, which the command ip neigh shows for real. A real switch also learns which port each MAC is on, and a real ARP entry times out after a while. Neither is drawn here.";

const LAPTOP_MAC = "02:00:00:00:00:10";
const PHONE_MAC = "02:00:00:00:00:20";

const REQUEST = [
  { label: "src MAC", value: LAPTOP_MAC },
  { label: "dst MAC", value: "ff:ff:ff:ff:ff:ff" },
  { label: "ARP", value: "request" },
  { label: "who has", value: "192.168.1.20" },
  { label: "tell", value: "192.168.1.10" },
];

const REPLY = [
  { label: "src MAC", value: PHONE_MAC, changed: true },
  { label: "dst MAC", value: LAPTOP_MAC, changed: true },
  { label: "ARP", value: "reply", changed: true },
  { label: "192.168.1.20 is at", value: PHONE_MAC, changed: true },
];

export const netM3ArpExchangeData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "switch", kind: "switch", label: "Switch", x: 210, y: 0 },
    { id: "laptop", kind: "host", label: "Laptop", x: 70, y: 110, addresses: ["192.168.1.10"] },
    { id: "phone", kind: "phone", label: "Phone", x: 350, y: 110, addresses: ["192.168.1.20"] },
  ],
  links: [
    { from: "laptop", to: "switch" },
    { from: "switch", to: "phone" },
  ],
  tables: [{ id: "arp", title: "Laptop's ARP table", device: "laptop", columns: ["IP address", "MAC address"], rows: [] }],
  steps: [
    {
      caption: "The laptop wants 192.168.1.20 but does not know its MAC. Its ARP table is empty.",
      highlight: { devices: ["laptop"] },
    },
    {
      caption: "The laptop broadcasts: who has 192.168.1.20? The destination MAC is ff:ff:ff:ff:ff:ff, so everyone hears it.",
      packet: { at: 0, fields: REQUEST },
      pick: {
        prompt: "The laptop knows the phone's IP address but not its MAC. Where does it send the ARP request?",
        options: [
          { label: "To the phone's MAC, directly", correct: false, why: "It does not know that MAC yet. That is what it is asking for." },
          { label: "To ff:ff:ff:ff:ff:ff, everyone", correct: true, why: "The broadcast MAC reaches every device on the link. Only the owner of the IP answers." },
          { label: "To the router, to pass along", correct: false, why: "The phone is on the same link, so no router is involved in finding its MAC." },
        ],
      },
    },
    {
      caption: "The switch floods the broadcast out its other ports, so the phone hears it too.",
      packet: { at: 1, fields: REQUEST },
      highlight: { devices: ["phone"] },
    },
    {
      caption: "Only the phone owns 192.168.1.20, so only it answers. The reply goes straight to the laptop's MAC.",
      packet: { at: 1, reverse: true, fields: REPLY },
      highlight: { devices: ["phone"] },
    },
    {
      caption: "The switch passes the reply to the laptop. Nobody else needs it.",
      packet: { at: 0, reverse: true, fields: REPLY.map((f) => ({ label: f.label, value: f.value })) },
      highlight: { devices: ["laptop"] },
    },
    {
      caption: "The laptop saves the answer in its ARP table. Now it can send to that MAC.",
      tableUpdates: [{ table: "arp", row: 0, cells: ["192.168.1.20", PHONE_MAC] }],
      highlight: { rows: [{ table: "arp", row: 0 }] },
      verdict: { text: "One broadcast, one answer, one entry", tone: "good" },
    },
  ],
};

function ArpExchangeBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM3ArpExchangeData });
}

export const netM3ArpExchange: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: ArpExchangeBeat,
};
