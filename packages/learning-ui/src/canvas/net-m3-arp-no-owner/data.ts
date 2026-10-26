import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 3.3 beat 5: an ARP request for an address nobody owns. The laptop's mask says
// 192.168.1.99 is local, so it broadcasts an ARP request. The switch floods it,
// the friend and the printer hear it, neither owns the address, so nothing
// answers. The laptop asks again, hears nothing again and gives up; the ARP
// table stays empty. This is the negative control from challenge 1, where a ping
// to 192.168.1.99 with -c2 -W1 ended with 2 sent, 0 received and unanswered ARP
// requests. The course does not promise a "Destination Host Unreachable" line,
// because that wording was not seen with those flags. Devices, addresses and
// MACs (02:...) are made up. The renderer is NetStepCanvas; the model is
// models/net-step.ts.
const TITLE = "Nobody owns the address: no reply";
const PURPOSE = "The laptop asks who has 192.168.1.99. Every device hears it, but nobody owns that address, so nobody answers.";
const LIMITS =
  "Three made-up devices and made-up MACs on one switch. The ARP table is a simplified view of the laptop's real one. A ping with no answer can have other causes: this picture explains one case, where the device list shows nobody owns the address. How long a real laptop keeps asking is not drawn.";

const LAPTOP_MAC = "02:00:00:00:00:23";

const REQUEST = [
  { label: "src MAC", value: LAPTOP_MAC },
  { label: "dst MAC", value: "ff:ff:ff:ff:ff:ff" },
  { label: "ARP", value: "request" },
  { label: "who has", value: "192.168.1.99" },
  { label: "tell", value: "192.168.1.23" },
];

export const netM3ArpNoOwnerData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "switch", kind: "switch", label: "Switch", x: 210, y: 0 },
    { id: "laptop", kind: "host", label: "Laptop", x: 70, y: 110, addresses: ["192.168.1.23"] },
    { id: "friend", kind: "host", label: "Friend", x: 210, y: 110, addresses: ["192.168.1.40"] },
    { id: "printer", kind: "host", label: "Printer", x: 350, y: 110, addresses: ["192.168.1.50"] },
  ],
  links: [
    { from: "laptop", to: "switch" },
    { from: "friend", to: "switch" },
    { from: "printer", to: "switch" },
  ],
  tables: [{ id: "arp", title: "Laptop's ARP table", device: "laptop", columns: ["IP address", "MAC address"], rows: [] }],
  steps: [
    {
      caption: "The laptop wants to reach 192.168.1.99. Its mask says that address is on its own network.",
      highlight: { devices: ["laptop"] },
    },
    {
      caption: "No row in the table, so the laptop broadcasts: who has 192.168.1.99?",
      packet: { at: 0, fields: REQUEST },
      highlight: { devices: ["laptop"] },
    },
    {
      caption: "The switch floods the request. The friend and the printer both hear it.",
      packet: { at: 1, reverse: true, fields: REQUEST },
      highlight: { links: [1, 2], devices: ["friend", "printer"] },
    },
    {
      caption: "Neither device owns 192.168.1.99, so neither answers. Nothing comes back.",
      highlight: { devices: ["friend", "printer"] },
      pick: {
        prompt: "Nobody owns 192.168.1.99. What does the laptop get back?",
        options: [
          { label: "An error from the switch", correct: false, why: "A switch only moves frames. It does not answer for the devices behind it." },
          { label: "A reply from the router", correct: false, why: "There is no router here. Only the owner of an address answers an ARP request." },
          { label: "Nothing at all", correct: true, why: "Only the owner of the address answers. With no owner, no reply ever comes." },
        ],
      },
    },
    {
      caption: "The laptop asks again and still hears nothing. It gives up. It never learns a MAC.",
      packet: { at: 0, fields: REQUEST },
      highlight: { devices: ["laptop"] },
    },
    {
      caption: "The ARP table stays empty. A ping to 192.168.1.99 gets 100% packet loss.",
      highlight: { devices: ["laptop"] },
      verdict: { text: "No owner, no reply, no MAC", tone: "warn" },
    },
  ],
};

function ArpNoOwnerBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM3ArpNoOwnerData });
}

export const netM3ArpNoOwner: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: ArpNoOwnerBeat,
};
