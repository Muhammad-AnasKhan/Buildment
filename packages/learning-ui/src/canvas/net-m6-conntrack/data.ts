import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 6.2 beat 5: conntrack -L after the clash. Each line of the real command is
// one conversation in two halves: the first half is what the device sent
// (src=192.168.1.24 ... sport=41000 dport=8080), the second half is the reply
// as it arrives at the router (src=203.0.113.80 dst=203.0.113.1 sport=8080
// dport=...). The last number of the second half is the port the server saw.
// The numbers are from the recorded masquerade run in replay-sessions.txt
// (session masquerade): the laptop's second half ends in dport=41000, the
// phone's in dport=15510. The kernel chose 15510 on that run; it differs on
// every run, which the step text says. The two tables are the two halves of
// the recorded lines, cut to the fields that matter, so they are a model view
// of the command, not its output. The renderer is NetStepCanvas; the model is
// models/net-step.ts.
const TITLE = "Read the real table: conntrack";
const PURPOSE = "After the clash the router holds two rows. Each row has two halves, and the new port is in the second half of the phone's row.";
const LIMITS =
  "The numbers come from one recorded run of the lab's masquerade script. The kernel chose the phone's new port, 15510, on that run, and it will differ on yours. The real command prints more fields (the protocol, the state, the seconds left on the timer) and the server's address and port in both halves; the two small tables keep only the fields that show the port change. The devices and addresses are made up.";

export const netM6ConntrackData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "laptop", kind: "host", label: "Laptop", x: 70, y: 110, addresses: ["192.168.1.23"] },
    { id: "phone", kind: "phone", label: "Phone", x: 210, y: 110, addresses: ["192.168.1.24"] },
    { id: "router", kind: "router", label: "Router", x: 210, y: 0, addresses: ["203.0.113.1"] },
    { id: "server", kind: "server", label: "Server", x: 350, y: 110, addresses: ["203.0.113.80"] },
  ],
  links: [
    { from: "laptop", to: "router" },
    { from: "phone", to: "router" },
    { from: "router", to: "server" },
  ],
  tables: [
    { id: "sent", title: "First half: what was sent", device: "router", columns: ["src", "sport"], rows: [] },
    { id: "reply", title: "Second half: the reply arrives", device: "router", columns: ["dst", "dport"], rows: [] },
  ],
  steps: [
    {
      caption: "Both devices sent from port 41000. In the router, conntrack -L prints one line for each conversation.",
      highlight: { devices: ["router"] },
    },
    {
      caption: "The laptop's line. First half: sport 41000. Second half: dport 41000, so its port was kept.",
      tableUpdates: [
        { table: "sent", row: 0, cells: ["192.168.1.23", "41000"] },
        { table: "reply", row: 0, cells: ["203.0.113.1", "41000"] },
      ],
      highlight: { devices: ["laptop"], rows: [{ table: "sent", row: 0 }, { table: "reply", row: 0 }] },
    },
    {
      caption: "The phone's line starts the same, with sport 41000. Look at where its second half ends.",
      tableUpdates: [
        { table: "sent", row: 1, cells: ["192.168.1.24", "41000"] },
        { table: "reply", row: 1, cells: ["203.0.113.1", "15510"] },
      ],
      highlight: { devices: ["phone"], rows: [{ table: "sent", row: 1 }, { table: "reply", row: 1 }] },
      pick: {
        prompt: "Look at the phone's line. Which number is the port the server saw?",
        options: [
          { label: "The server's port, 8080", correct: false, why: "8080 is where the server listens. It is not the phone's source port." },
          { label: "The first half's sport", correct: false, why: "That is 41000, the port the phone sent from. The router changed it on the way out." },
          { label: "The second half's dport", correct: true, why: "The second half is the reply as it arrives at the router. Its dport is the port the server saw." },
        ],
      },
    },
    {
      caption: "In this recorded run the new port was 15510. Your run will show a different number.",
      highlight: { rows: [{ table: "reply", row: 1 }] },
      verdict: { text: "New port: second half, dport", tone: "accent" },
    },
  ],
};

function ConntrackBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM6ConntrackData });
}

export const netM6Conntrack: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: ConntrackBeat,
};
