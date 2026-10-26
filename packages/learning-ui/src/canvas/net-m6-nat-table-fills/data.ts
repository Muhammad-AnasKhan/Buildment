import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 6.2 beat 2: the router's NAT table gains one row for every conversation. The
// laptop opens a connection (row 1), the phone opens one (row 2), and the
// laptop opens a second one from another port (row 3): three conversations,
// three rows. The table is a model view of what conntrack -L lists for real,
// not a recording; each row pairs the inside address and port with the outside
// address and port. Every source port is different, so every port is kept.
// Addresses are made up: private at home, documentation range outside. The
// renderer is NetStepCanvas; the model is models/net-step.ts.
const TITLE = "One row per conversation";
const PURPOSE = "Open connections from the laptop and the phone and watch the router's NAT table gain a row each time.";
const LIMITS =
  "A model view of the router's table with two columns. The real table, which conntrack -L lists, has more fields and also remembers the server's side and a timer for each row. Rows here are never removed; timers come in 6.5. Made-up devices and addresses; 203.0.113.1 comes from a range kept for examples.";

const FROM = (src: string) => [
  { label: "src", value: src },
  { label: "dst", value: "203.0.113.80:8080" },
];

export const netM6NatTableFillsData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "laptop", kind: "host", label: "Laptop", x: 70, y: 110, addresses: ["192.168.1.23"] },
    { id: "phone", kind: "phone", label: "Phone", x: 210, y: 110, addresses: ["192.168.1.24"] },
    { id: "router", kind: "router", label: "Router", x: 210, y: 0, addresses: ["192.168.1.1", "203.0.113.1"] },
    { id: "server", kind: "server", label: "Server", x: 350, y: 110, addresses: ["203.0.113.80"] },
  ],
  links: [
    { from: "laptop", to: "router" },
    { from: "phone", to: "router" },
    { from: "router", to: "server" },
  ],
  tables: [{ id: "nat", title: "The router's NAT table", device: "router", columns: ["Inside", "Outside"], rows: [] }],
  steps: [
    {
      caption: "The NAT table is empty. No device has opened a connection yet.",
      highlight: { devices: ["router"] },
    },
    {
      caption: "The laptop opens a connection from port 41000. The router adds a row.",
      packet: { at: 0, fields: FROM("192.168.1.23:41000") },
      tableUpdates: [{ table: "nat", row: 0, cells: ["192.168.1.23:41000", "203.0.113.1:41000"] }],
      highlight: { devices: ["laptop"], rows: [{ table: "nat", row: 0 }] },
    },
    {
      caption: "The phone opens a connection from port 52000. The router adds a second row.",
      packet: { at: 1, fields: FROM("192.168.1.24:52000") },
      tableUpdates: [{ table: "nat", row: 1, cells: ["192.168.1.24:52000", "203.0.113.1:52000"] }],
      highlight: { devices: ["phone"], rows: [{ table: "nat", row: 1 }] },
    },
    {
      caption: "The laptop opens a second connection, from port 41001. This is a new conversation.",
      packet: { at: 0, fields: FROM("192.168.1.23:41001") },
      tableUpdates: [{ table: "nat", row: 2, cells: ["192.168.1.23:41001", "203.0.113.1:41001"] }],
      highlight: { devices: ["laptop"], rows: [{ table: "nat", row: 2 }] },
      pick: {
        prompt: "The laptop opens a second connection from port 41001. How many rows will the table hold?",
        options: [
          { label: "Two: the laptop has a row", correct: false, why: "The table counts conversations, not devices. A second connection is a second conversation." },
          { label: "Three: a row per conversation", correct: true, why: "Every conversation gets its own row. The laptop now has two conversations." },
          { label: "Four: a row per direction", correct: false, why: "One row serves both directions. The same row sends the replies home." },
        ],
      },
    },
    {
      caption: "Three conversations, three rows. The table counts conversations, not devices.",
      highlight: { rows: [{ table: "nat", row: 0 }, { table: "nat", row: 1 }, { table: "nat", row: 2 }] },
      verdict: { text: "Three conversations, three rows", tone: "good" },
    },
  ],
};

function NatTableFillsBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM6NatTableFillsData });
}

export const netM6NatTableFills: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: NatTableFillsBeat,
};
