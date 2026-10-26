import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 5.2 beat 2: one laptop (192.168.1.23) runs three apps. Tab 1 and tab 2 talk
// to the same website, 203.0.113.80 port 443; a chat app talks to a chat
// server, 192.0.2.44 port 5222. The laptop gives each app its own port
// (51234, 51236, 40000), and the table of sockets fills one row per app. At
// the end a chat message comes back and the port in it picks the chat app.
// There is no pick here; the next beat carries the pick, so the chapter keeps
// to its budget of three assessments. The two server addresses are
// documentation addresses; the ports are chosen by the model. The renderer is
// NetStepCanvas; the model is models/net-step.ts.
const TITLE = "One address, three apps, three ports";
const PURPOSE = "A laptop runs two browser tabs and a chat app. Each app gets its own port on the laptop, and the laptop keeps a table of them.";
const LIMITS =
  "One laptop and three apps, with ports chosen by the model. A real computer picks each port itself, from a range that depends on the operating system. The table is a simplified view of the laptop's sockets, which the commands ss -tn and netstat -an list for real. Two tabs may also share one connection in a real browser; here each tab has its own.";

const TAB1_OUT = [
  { label: "from", value: "192.168.1.23:51234" },
  { label: "to", value: "203.0.113.80:443" },
];
const TAB2_OUT = [
  { label: "from", value: "192.168.1.23:51236" },
  { label: "to", value: "203.0.113.80:443" },
];
const CHAT_OUT = [
  { label: "from", value: "192.168.1.23:40000" },
  { label: "to", value: "192.0.2.44:5222" },
];
const CHAT_IN = [
  { label: "from", value: "192.0.2.44:5222" },
  { label: "to", value: "192.168.1.23:40000" },
];

export const netM5SocketsPortsData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "laptop", kind: "host", label: "Laptop", x: 210, y: 0, addresses: ["192.168.1.23"] },
    { id: "website", kind: "server", label: "Website", x: 70, y: 130, addresses: ["203.0.113.80"] },
    { id: "chat", kind: "server", label: "Chat", x: 350, y: 130, addresses: ["192.0.2.44"] },
  ],
  links: [
    { from: "laptop", to: "website" },
    { from: "laptop", to: "chat" },
  ],
  tables: [{ id: "sockets", title: "Laptop's sockets", device: "laptop", columns: ["App", "My port", "Talks to"], rows: [] }],
  steps: [
    {
      caption: "The laptop has one address, 192.168.1.23. Three apps are about to talk through it.",
      highlight: { devices: ["laptop"] },
    },
    {
      caption: "Tab 1 opens. The laptop gives it port 51234. It talks to the website's port 443.",
      packet: { at: 0, fields: TAB1_OUT },
      tableUpdates: [{ table: "sockets", row: 0, cells: ["Tab 1", "51234", "203.0.113.80:443"] }],
      highlight: { devices: ["website"], rows: [{ table: "sockets", row: 0 }] },
    },
    {
      caption: "Tab 2 opens the same website. It gets its own port, 51236.",
      packet: { at: 0, fields: TAB2_OUT },
      tableUpdates: [{ table: "sockets", row: 1, cells: ["Tab 2", "51236", "203.0.113.80:443"] }],
      highlight: { devices: ["website"], rows: [{ table: "sockets", row: 1 }] },
    },
    {
      caption: "The chat app opens. It gets port 40000 and talks to the chat server's port 5222.",
      packet: { at: 1, fields: CHAT_OUT },
      tableUpdates: [{ table: "sockets", row: 2, cells: ["Chat app", "40000", "192.0.2.44:5222"] }],
      highlight: { devices: ["chat"], rows: [{ table: "sockets", row: 2 }] },
    },
    {
      caption: "A chat message comes back. The laptop reads the port in it and gives the message to the chat app.",
      packet: { at: 1, reverse: true, fields: CHAT_IN },
      highlight: { devices: ["laptop"], rows: [{ table: "sockets", row: 2 }] },
      verdict: { text: "The port picks the app", tone: "good" },
    },
  ],
};

function SocketsPortsBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM5SocketsPortsData });
}

export const netM5SocketsPorts: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: SocketsPortsBeat,
};
