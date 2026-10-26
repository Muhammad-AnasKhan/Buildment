import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 6.2 beat 4: the laptop and the phone both send from source port 41000 to the
// same server (203.0.113.80:8080) through a Linux router doing masquerade. The
// laptop's conversation is open first, so it keeps port 41000. The phone's
// packet would look the same after rewriting, so the router gives it a new
// source port. Tested behaviour (dossier 5.6): the port is rewritten only when
// it would clash, and the server saw two different ports. The new port is
// chosen by the kernel and differs on every run, so this canvas writes "new
// port" and never prints a number as the answer. The table is a model view of
// what conntrack -L lists. The renderer is NetStepCanvas; the model is
// models/net-step.ts.
const TITLE = "Same port: one must change";
const PURPOSE = "The laptop and the phone both send from port 41000 to one server. The laptop keeps its port. The phone gets a new one.";
const LIMITS =
  "This is how a Linux router with a masquerade rule behaves in the course lab: the port is kept unless two conversations would look the same. Other routers may differ, and no measurement of home routers is sourced. The new port is chosen by the router and differs every run, so it is drawn as new port. Made-up devices and addresses; 203.0.113.1 comes from a range kept for examples.";

const BOTH_SERVER = [
  { label: "dst", value: "203.0.113.80:8080" },
];

export const netM6NatClashData: NetStepData = {
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
      caption: "The laptop and the phone will both send from port 41000 to the same server.",
      highlight: { devices: ["laptop", "phone"] },
    },
    {
      caption: "The laptop goes first. Port 41000 is free, so the router keeps it.",
      packet: { at: 2, fields: [{ label: "src", value: "203.0.113.1:41000" }, ...BOTH_SERVER] },
      tableUpdates: [{ table: "nat", row: 0, cells: ["192.168.1.23:41000", "203.0.113.1:41000"] }],
      highlight: { devices: ["laptop"], rows: [{ table: "nat", row: 0 }] },
    },
    {
      caption: "Now the phone sends from 41000 too. After rewriting it would look the same as the laptop's conversation.",
      packet: { at: 1, fields: [{ label: "src", value: "192.168.1.24:41000" }, ...BOTH_SERVER] },
      highlight: { devices: ["phone"], rows: [{ table: "nat", row: 0 }] },
    },
    {
      caption: "The router gives the phone a new source port. The packet leaves for the server with it.",
      packet: { at: 2, fields: [{ label: "src", value: "203.0.113.1:new port", changed: true }, ...BOTH_SERVER] },
      tableUpdates: [{ table: "nat", row: 1, cells: ["192.168.1.24:41000", "203.0.113.1:new"] }],
      highlight: { devices: ["router"], rows: [{ table: "nat", row: 1 }] },
    },
    {
      caption: "The server replies to the new port. The router must find the phone.",
      packet: {
        at: 2,
        reverse: true,
        fields: [{ label: "src", value: "203.0.113.80:8080" }, { label: "dst", value: "203.0.113.1:new port" }],
      },
      highlight: { rows: [{ table: "nat", row: 1 }] },
      pick: {
        prompt: "The reply arrives for the new port. How does the router know it belongs to the phone?",
        options: [
          { label: "The table row names the phone", correct: true, why: "The row for that port holds the phone's address and port. The router reads it and sends the reply there." },
          { label: "It asks every device at home", correct: false, why: "A router does not ask around. It looks in its table." },
          { label: "It guesses from the reply data", correct: false, why: "The router never reads the data. It matches addresses and ports to a row." },
        ],
      },
    },
    {
      caption: "The router finds the row, rewrites the destination back, and passes the reply to the phone.",
      packet: {
        at: 1,
        reverse: true,
        fields: [{ label: "src", value: "203.0.113.80:8080" }, { label: "dst", value: "192.168.1.24:41000", changed: true }],
      },
      highlight: { devices: ["phone"], rows: [{ table: "nat", row: 1 }] },
      verdict: { text: "Laptop kept 41000. Phone got a new port.", tone: "good" },
    },
  ],
};

function NatClashBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM6NatClashData });
}

export const netM6NatClash: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: NatClashBeat,
};
