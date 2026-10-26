import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 3.3 beat 3: the answer is remembered. The laptop (192.168.1.23) has an empty
// ARP table. The friend's reply (192.168.1.40 is at 02:00:00:00:00:40) arrives
// and the laptop saves it as one row. A second packet to the same address finds
// the row, so the frame goes straight to the friend's MAC with no new request.
// The last step says a row is lost later and the laptop must ask again; the
// course gives no timeout figure, because the standard leaves ageing to the
// implementer. The table is a model view of what ip neigh (Linux) or arp -a
// (Windows, macOS) lists, not a recording. Devices, addresses and MACs
// (02:...) are made up. The renderer is NetStepCanvas; the model is
// models/net-step.ts.
const TITLE = "The answer is remembered";
const PURPOSE = "The laptop saves the friend's MAC in its ARP table. The next packet to that address needs no new request.";
const LIMITS =
  "Two made-up devices on one switch, with made-up MACs. The table is a simplified view of the laptop's ARP cache: ip neigh shows the real one on Linux and arp -a on Windows and macOS. A real table has more columns and more rows. A real row is dropped after a while, and the course gives no number for that.";

const LAPTOP_MAC = "02:00:00:00:00:23";
const FRIEND_MAC = "02:00:00:00:00:40";

export const netM3ArpTableData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "switch", kind: "switch", label: "Switch", x: 210, y: 0 },
    { id: "laptop", kind: "host", label: "Laptop", x: 70, y: 110, addresses: ["192.168.1.23"] },
    { id: "friend", kind: "host", label: "Friend", x: 350, y: 110, addresses: ["192.168.1.40"] },
  ],
  links: [
    { from: "laptop", to: "switch" },
    { from: "switch", to: "friend" },
  ],
  tables: [{ id: "arp", title: "Laptop's ARP table", device: "laptop", columns: ["IP address", "MAC address"], rows: [] }],
  steps: [
    {
      caption: "The laptop's ARP table is empty. It has no MAC for 192.168.1.40 yet.",
      highlight: { devices: ["laptop"] },
    },
    {
      caption: "The friend's reply reaches the laptop: 192.168.1.40 is at 02:00:00:00:00:40.",
      packet: {
        at: 0,
        reverse: true,
        fields: [
          { label: "src MAC", value: FRIEND_MAC },
          { label: "dst MAC", value: LAPTOP_MAC },
          { label: "ARP", value: "reply" },
          { label: "192.168.1.40 is at", value: FRIEND_MAC },
        ],
      },
      highlight: { devices: ["laptop"] },
    },
    {
      caption: "The laptop saves the answer as a row: an IP address and its MAC.",
      tableUpdates: [{ table: "arp", row: 0, cells: ["192.168.1.40", FRIEND_MAC] }],
      highlight: { rows: [{ table: "arp", row: 0 }] },
    },
    {
      caption: "Now the laptop sends a second packet to 192.168.1.40. It checks its ARP table first.",
      packet: {
        at: 0,
        fields: [
          { label: "src MAC", value: LAPTOP_MAC },
          { label: "dst MAC", value: FRIEND_MAC },
          { label: "dst IP", value: "192.168.1.40" },
        ],
      },
      highlight: { rows: [{ table: "arp", row: 0 }] },
      pick: {
        prompt: "The table already has a row for 192.168.1.40. What does the laptop do for this second packet?",
        options: [
          { label: "Ask again with a broadcast", correct: false, why: "A broadcast is for finding a MAC. The laptop already has this one in its table." },
          { label: "Use the saved row", correct: true, why: "The row gives the MAC, so the frame can go straight to the friend." },
          { label: "Send it to the router", correct: false, why: "The friend is on the same network, so no router is needed." },
        ],
      },
    },
    {
      caption: "The switch passes the frame to the friend. No ARP request was needed.",
      packet: {
        at: 1,
        fields: [
          { label: "src MAC", value: LAPTOP_MAC },
          { label: "dst MAC", value: FRIEND_MAC },
          { label: "dst IP", value: "192.168.1.40" },
        ],
      },
      highlight: { devices: ["friend"] },
      verdict: { text: "A saved row means no new request", tone: "good" },
    },
    {
      caption: "Once a row is gone, the laptop must ask again. A real table drops old rows after a while.",
      highlight: { devices: ["laptop"] },
    },
  ],
};

function ArpTableBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM3ArpTableData });
}

export const netM3ArpTable: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: ArpTableBeat,
};
