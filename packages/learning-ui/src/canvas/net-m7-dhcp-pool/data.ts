import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 7.2 beat 5 (playable): a DHCP pool is finite. The café shrinks its pool to
// three addresses, 10.5.0.50 to 10.5.0.52 (the real pool in the chapter is
// 10.5.0.50 to 10.5.0.200). Three phones take the three addresses, each for a
// lease of 3600 s [S23] [S64]. A fourth phone broadcasts DISCOVER and gets no
// OFFER, because no address is free. When a lease ends, its address is free
// again, and the fourth phone gets it. This scenario is hypothetical: the
// dossier found no incident source for pool exhaustion (section 7). The
// planned netlab beat is replaced by this step canvas (same slug). The
// DISCOVER fields (src 0.0.0.0, dst 255.255.255.255) are what the lab capture
// shows. The renderer is NetStepCanvas; the model is models/net-step.ts.
const TITLE = "A small pool runs out";
const PURPOSE = "A pool of three addresses is full. A fourth phone gets no offer until a lease ends and an address comes back.";
const LIMITS =
  "A made-up scene with a pool of only three addresses, 10.5.0.50 to 10.5.0.52, to show what an empty pool does. The real café pool in the chapter is 10.5.0.50 to 10.5.0.200. The scenario is hypothetical: no real incident is behind it. Renewals, early release and the hour-long timers are not drawn, and a real server may handle a full pool in other ways.";

const ack = (address: string) => [
  { label: "ACK", value: address },
  { label: "lease", value: "3600 s" },
];

export const netM7DhcpPoolData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "server", kind: "server", label: "Server", x: 210, y: 100, addresses: ["10.5.0.1"] },
    { id: "p1", kind: "phone", label: "Phone 1", x: 70, y: 0 },
    { id: "p2", kind: "phone", label: "Phone 2", x: 350, y: 0 },
    { id: "p3", kind: "phone", label: "Phone 3", x: 70, y: 200 },
    { id: "p4", kind: "phone", label: "Phone 4", x: 350, y: 200 },
  ],
  links: [
    { from: "p1", to: "server" },
    { from: "p2", to: "server" },
    { from: "p3", to: "server" },
    { from: "p4", to: "server" },
  ],
  tables: [
    {
      id: "pool",
      title: "The server's pool",
      device: "server",
      columns: ["Address", "Held by"],
      rows: [
        ["10.5.0.50", "free"],
        ["10.5.0.51", "free"],
        ["10.5.0.52", "free"],
      ],
    },
  ],
  steps: [
    {
      caption: "The café shrinks its pool to three addresses, 10.5.0.50 to 10.5.0.52. All three are free.",
      highlight: { devices: ["server"] },
    },
    {
      caption: "Phone 1 asks and gets 10.5.0.50 for 3600 seconds.",
      packet: { at: 0, reverse: true, fields: ack("10.5.0.50") },
      tableUpdates: [{ table: "pool", row: 0, cells: ["10.5.0.50", "Phone 1"] }],
      highlight: { devices: ["p1"], rows: [{ table: "pool", row: 0 }] },
    },
    {
      caption: "Phone 2 asks and gets 10.5.0.51.",
      packet: { at: 1, reverse: true, fields: ack("10.5.0.51") },
      tableUpdates: [{ table: "pool", row: 1, cells: ["10.5.0.51", "Phone 2"] }],
      highlight: { devices: ["p2"], rows: [{ table: "pool", row: 1 }] },
    },
    {
      caption: "Phone 3 asks and gets 10.5.0.52. All three addresses are now held.",
      packet: { at: 2, reverse: true, fields: ack("10.5.0.52") },
      tableUpdates: [{ table: "pool", row: 2, cells: ["10.5.0.52", "Phone 3"] }],
      highlight: { devices: ["p3"], rows: [{ table: "pool", row: 2 }] },
      verdict: { text: "Pool full: 3 of 3 held", tone: "warn" },
    },
    {
      caption: "Phone 4 shouts DISCOVER. Every address is held, so the server has nothing to offer. No OFFER comes back.",
      packet: {
        at: 3,
        fields: [
          { label: "DHCP", value: "DISCOVER" },
          { label: "src IP", value: "0.0.0.0" },
          { label: "dst IP", value: "255.255.255.255" },
        ],
      },
      highlight: { devices: ["p4"] },
      verdict: { text: "No free address: no OFFER", tone: "bad" },
    },
    {
      caption: "An hour later Phone 1 has left and its lease has run out. Its address is free again.",
      tableUpdates: [{ table: "pool", row: 0, cells: ["10.5.0.50", "free"] }],
      highlight: { rows: [{ table: "pool", row: 0 }] },
      pick: {
        prompt: "Phone 1's lease has run out and Phone 4 asks again. What can the server offer it?",
        options: [
          { label: "Nothing: the pool stays full", correct: false, why: "The expired lease freed 10.5.0.50, so the pool is not full any more." },
          { label: "10.5.0.50, now free", correct: true, why: "A lease lasts until its timer runs out. After that the address is free to hand out again." },
          { label: "10.5.0.51, Phone 2's address", correct: false, why: "Phone 2's lease is still running, so that address is not free." },
        ],
      },
    },
    {
      caption: "Phone 4 asks again and gets 10.5.0.50. It joined when a lease ended.",
      packet: { at: 3, reverse: true, fields: ack("10.5.0.50") },
      tableUpdates: [{ table: "pool", row: 0, cells: ["10.5.0.50", "Phone 4"] }],
      highlight: { devices: ["p4"], rows: [{ table: "pool", row: 0 }] },
      verdict: { text: "Phone 4 joins when a lease ends", tone: "good" },
    },
  ],
};

function DhcpPoolBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM7DhcpPoolData });
}

export const netM7DhcpPool: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: DhcpPoolBeat,
};
