import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 3.4 beat 2: one broadcast on a flat network. The fictional school has 100
// staff laptops, 1 exam server and 499 guest phones on one network. One staff
// laptop sends an ARP request to ff:ff:ff:ff:ff:ff; the switches flood it, so 99
// other staff laptops, the exam server and 499 guest phones hear it: 599 other
// devices. Only the owner of the address would answer. The counts are the
// model's, not a measurement of a real school. The addresses are private
// (10.0.0.0/22 would hold them) and the MACs are made up (02:...). One switch
// stands for the many switches of a flat network. The renderer is NetStepCanvas;
// the model is models/net-step.ts.
const TITLE = "Every broadcast reaches every device";
const PURPOSE = "One staff laptop sends an ARP request on a flat network of 600 devices. All 599 others hear it.";
const LIMITS =
  "A made-up school, not a measurement. Groups are drawn as single cards because 600 icons would hide the counts, and one switch stands for the many switches of a real flat network. The sender is not counted. Hearing the request is not the same as answering it: only the owner of the address answers.";

const REQUEST = [
  { label: "src MAC", value: "02:00:00:00:00:07" },
  { label: "dst MAC", value: "ff:ff:ff:ff:ff:ff" },
  { label: "ARP", value: "request" },
  { label: "who has", value: "10.0.0.9" },
  { label: "tell", value: "10.0.0.7" },
];

export const netM3FlatBroadcastData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "laptop", kind: "host", label: "Laptop", x: 70, y: 0, addresses: ["10.0.0.7"] },
    { id: "staff", kind: "host", label: "Staff", x: 350, y: 0, addresses: ["99 laptops"] },
    { id: "switch", kind: "switch", label: "Switch", x: 210, y: 90 },
    { id: "exam", kind: "server", label: "Exam", x: 70, y: 180, addresses: ["1 server"] },
    { id: "guests", kind: "phone", label: "Guests", x: 350, y: 180, addresses: ["499 phones"] },
  ],
  links: [
    { from: "laptop", to: "switch" },
    { from: "staff", to: "switch" },
    { from: "exam", to: "switch" },
    { from: "guests", to: "switch" },
  ],
  tables: [{ id: "heard", title: "Who hears the request", device: "switch", columns: ["Group", "Hears it"], rows: [] }],
  steps: [
    {
      caption: "One flat network: 100 staff laptops, 1 exam server, 499 guest phones. One laptop sends a request.",
      highlight: { devices: ["laptop"] },
    },
    {
      caption: "The laptop broadcasts: who has 10.0.0.9? The destination MAC is ff:ff:ff:ff:ff:ff.",
      packet: { at: 0, fields: REQUEST },
      highlight: { devices: ["laptop"] },
      pick: {
        prompt: "The laptop broadcasts on this flat network. Which devices hear the request?",
        options: [
          { label: "All the other devices", correct: true, why: "A broadcast goes to every device on the network. Only the owner answers, but all of them hear it." },
          { label: "Only the other staff laptops", correct: false, why: "Staff and guests share this one network, so the broadcast does not stop at the staff." },
          { label: "Only the device that owns it", correct: false, why: "The laptop broadcasts because it does not know who owns the address, so everyone hears it." },
        ],
      },
    },
    {
      caption: "The switch floods the request. The other 99 staff laptops hear it.",
      packet: { at: 1, reverse: true, fields: REQUEST },
      tableUpdates: [{ table: "heard", row: 0, cells: ["Other staff", "99"] }],
      highlight: { devices: ["staff"], rows: [{ table: "heard", row: 0 }] },
    },
    {
      caption: "The exam server hears it too.",
      packet: { at: 2, reverse: true, fields: REQUEST },
      tableUpdates: [{ table: "heard", row: 1, cells: ["Exam server", "1"] }],
      highlight: { devices: ["exam"], rows: [{ table: "heard", row: 1 }] },
    },
    {
      caption: "So do all 499 guest phones.",
      packet: { at: 3, reverse: true, fields: REQUEST },
      tableUpdates: [{ table: "heard", row: 2, cells: ["Guest phones", "499"] }],
      highlight: { devices: ["guests"], rows: [{ table: "heard", row: 2 }] },
    },
    {
      caption: "99 + 1 + 499 = 599 devices heard one question. Only the owner of 10.0.0.9 answers.",
      tableUpdates: [{ table: "heard", row: 3, cells: ["Total heard", "599"] }],
      highlight: { rows: [{ table: "heard", row: 3 }] },
      verdict: { text: "599 devices heard one question", tone: "warn" },
    },
  ],
};

function FlatBroadcastBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM3FlatBroadcastData });
}

export const netM3FlatBroadcast: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: FlatBroadcastBeat,
};
