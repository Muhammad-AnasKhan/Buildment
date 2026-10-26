import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 3.3 beat 4: a switch learns where each MAC lives. A frame from the friend
// arrives on port 2, so the switch writes the friend's source MAC beside port 2.
// The frame is for the laptop, which the switch has not seen yet, so it floods
// the frame out every other port (never back out the arrival port). When the
// laptop answers on port 1 the switch learns that MAC too, and the next frame to
// the friend leaves by port 2 only. This is the switch's MAC-to-port table, not
// the laptop's ARP table. It is a model view, not a recording. Devices and MACs
// (02:...) are made up. The renderer is NetStepCanvas; the model is
// models/net-step.ts.
const TITLE = "A switch learns where each MAC lives";
const PURPOSE = "A switch writes each sender's MAC beside the port it arrived on. A MAC it has not seen yet is sent out every other port.";
const LIMITS =
  "One made-up switch with three ports and made-up MACs. A real switch ages entries out and has many more ports and more columns, and a broadcast is always sent out every other port. None of that is drawn. This is the switch's MAC table, a different table from the laptop's ARP table, which maps an IP address to a MAC.";

const LAPTOP_MAC = "02:00:00:00:00:23";
const FRIEND_MAC = "02:00:00:00:00:40";

const FROM_FRIEND = [
  { label: "src MAC", value: FRIEND_MAC },
  { label: "dst MAC", value: LAPTOP_MAC },
];

const FROM_LAPTOP = [
  { label: "src MAC", value: LAPTOP_MAC },
  { label: "dst MAC", value: FRIEND_MAC },
];

export const netM3SwitchLearningData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "switch", kind: "switch", label: "Switch", x: 210, y: 0 },
    { id: "laptop", kind: "host", label: "Laptop", x: 70, y: 120, addresses: ["MAC ...:23"] },
    { id: "friend", kind: "host", label: "Friend", x: 210, y: 120, addresses: ["MAC ...:40"] },
    { id: "printer", kind: "host", label: "Printer", x: 350, y: 120, addresses: ["MAC ...:50"] },
  ],
  links: [
    { from: "laptop", to: "switch", label: "port 1" },
    { from: "friend", to: "switch", label: "port 2" },
    { from: "printer", to: "switch", label: "port 3" },
  ],
  tables: [{ id: "macs", title: "The switch's MAC table", device: "switch", columns: ["MAC address", "Port"], rows: [] }],
  steps: [
    {
      caption: "The switch has just started. Its MAC table is empty.",
      highlight: { devices: ["switch"] },
    },
    {
      caption: "A frame from the friend arrives on port 2. Its source MAC is 02:00:00:00:00:40.",
      packet: { at: 1, fields: FROM_FRIEND },
      highlight: { devices: ["switch"] },
      pick: {
        prompt: "What does the switch write in its table from this frame?",
        options: [
          { label: "Friend's MAC is on port 2", correct: true, why: "The source MAC says who sent the frame. The port says where that sender is." },
          { label: "Laptop's MAC is on port 2", correct: false, why: "The laptop is only the destination. The switch does not know where it is yet." },
          { label: "Nothing, it needs an ARP reply", correct: false, why: "A switch learns from the source MAC of any frame it sees, ARP or not." },
        ],
      },
    },
    {
      caption: "The switch writes the source MAC beside port 2: 02:00:00:00:00:40 is on port 2.",
      tableUpdates: [{ table: "macs", row: 0, cells: [FRIEND_MAC, "2"] }],
      highlight: { rows: [{ table: "macs", row: 0 }] },
    },
    {
      caption: "It does not know where 02:00:00:00:00:23 is, so it floods the frame out every other port.",
      packet: { at: 0, reverse: true, fields: FROM_FRIEND },
      highlight: { devices: ["laptop"] },
    },
    {
      caption: "The printer gets a copy too. Its MAC does not match, so it ignores the frame.",
      packet: { at: 2, reverse: true, fields: FROM_FRIEND },
      highlight: { devices: ["printer"] },
    },
    {
      caption: "The laptop answers. The frame arrives on port 1, so the switch learns 02:00:00:00:00:23 is on port 1.",
      packet: { at: 0, fields: FROM_LAPTOP },
      tableUpdates: [{ table: "macs", row: 1, cells: [LAPTOP_MAC, "1"] }],
      highlight: { rows: [{ table: "macs", row: 1 }] },
    },
    {
      caption: "The switch sends the frame out port 2 only. The printer hears nothing.",
      packet: { at: 1, reverse: true, fields: FROM_LAPTOP },
      highlight: { rows: [{ table: "macs", row: 0 }] },
      verdict: { text: "Known: one port. Unknown: the rest", tone: "good" },
      pick: {
        prompt: "The laptop's frame is for 02:00:00:00:00:40. Where does the switch send it?",
        options: [
          { label: "Out ports 1 and 3", correct: false, why: "Flooding is for a MAC the switch has not learned. This one is in its table." },
          { label: "Out port 2 only", correct: true, why: "The table says that MAC is on port 2, so the switch uses that one port." },
          { label: "Back out port 1", correct: false, why: "Port 1 is where the frame came in. A switch never sends a frame back out its arrival port." },
        ],
      },
    },
  ],
};

function SwitchLearningBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM3SwitchLearningData });
}

export const netM3SwitchLearning: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: SwitchLearningBeat,
};
