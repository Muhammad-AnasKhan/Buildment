import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 6.1 beat 1: fifteen devices at home (192.168.1.20 to .34) each open a
// connection to the same server (203.0.113.80). Every packet leaves the router
// with the router's outside address as its source, so the server's log shows
// the same source address, 203.0.113.45, fifteen times. Three devices are
// drawn (Device 1, Device 2 and Device 15); the step text says the rest do the
// same. The addresses are made up: private ranges at home, documentation
// ranges (203.0.113.0/24) outside. The renderer is NetStepCanvas; the model is
// models/net-step.ts.
const TITLE = "Fifteen devices, one address";
const PURPOSE = "Fifteen devices at home each open a connection to one server. The server's log shows the same source address every time.";
const LIMITS =
  "Three of the fifteen devices are drawn; the others behave the same. Linux-style NAT only. The server's log is a simple model: one row, with a count. The router's outside address 203.0.113.45 is a stand-in for a public address and comes from a range kept for examples. The lab you build in 6.7 uses 203.0.113.1 for the same job.";

const PACKET_OUT = (src: string, changed?: boolean) => [
  { label: "src IP", value: src, ...(changed ? { changed: true } : {}) },
  { label: "dst IP", value: "203.0.113.80" },
];

export const netM6HomeRouterFirstLookData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "dev1", kind: "phone", label: "Device 1", x: 70, y: 0, addresses: ["192.168.1.20"] },
    { id: "dev2", kind: "host", label: "Device 2", x: 210, y: 0, addresses: ["192.168.1.21"] },
    { id: "dev15", kind: "host", label: "Device 15", x: 350, y: 0, addresses: ["192.168.1.34"] },
    { id: "router", kind: "router", label: "Router", x: 210, y: 110, addresses: ["192.168.1.1", "203.0.113.45"] },
    { id: "server", kind: "server", label: "Server", x: 210, y: 220, addresses: ["203.0.113.80"] },
  ],
  links: [
    { from: "dev1", to: "router" },
    { from: "dev2", to: "router" },
    { from: "dev15", to: "router" },
    { from: "router", to: "server" },
  ],
  tables: [{ id: "log", title: "The server's log", device: "server", columns: ["Source address", "Connections"], rows: [] }],
  steps: [
    {
      caption: "Fifteen devices share one home network. The server's log is empty.",
      highlight: { devices: ["dev1", "dev2", "dev15"] },
    },
    {
      caption: "Device 1 opens a connection to the server. Its source address is private.",
      packet: { at: 0, fields: PACKET_OUT("192.168.1.20") },
      highlight: { devices: ["dev1"] },
    },
    {
      caption: "The router rewrites the source to its outside address. The server logs one connection.",
      packet: { at: 3, fields: PACKET_OUT("203.0.113.45", true) },
      tableUpdates: [{ table: "log", row: 0, cells: ["203.0.113.45", "1"] }],
      highlight: { rows: [{ table: "log", row: 0 }] },
    },
    {
      caption: "The server answers. It sends the reply to the only address it has seen.",
      packet: {
        at: 3,
        reverse: true,
        fields: [
          { label: "src IP", value: "203.0.113.80" },
          { label: "dst IP", value: "203.0.113.45" },
        ],
      },
      pick: {
        prompt: "The server answers the connection. Which address does it send the reply to?",
        options: [
          { label: "192.168.1.20, Device 1", correct: false, why: "The server never saw this address. The router replaced it before the packet left home." },
          { label: "203.0.113.45, the router", correct: true, why: "The server only knows the source address it received: the router's outside address." },
          { label: "192.168.1.1, router inside", correct: false, why: "That is the router's inside address. It means something only at home." },
        ],
      },
    },
    {
      caption: "The router remembers who asked, and passes the reply to Device 1.",
      packet: {
        at: 0,
        reverse: true,
        fields: [
          { label: "src IP", value: "203.0.113.80" },
          { label: "dst IP", value: "192.168.1.20", changed: true },
        ],
      },
      highlight: { devices: ["dev1"] },
    },
    {
      caption: "Device 2 does the same. The server logs the same address again.",
      packet: { at: 3, fields: PACKET_OUT("203.0.113.45", true) },
      tableUpdates: [{ table: "log", row: 0, cells: ["203.0.113.45", "2"] }],
      highlight: { devices: ["dev2"], rows: [{ table: "log", row: 0 }] },
    },
    {
      caption: "Thirteen more devices connect. The log shows 203.0.113.45 fifteen times.",
      packet: { at: 3, fields: PACKET_OUT("203.0.113.45", true) },
      tableUpdates: [{ table: "log", row: 0, cells: ["203.0.113.45", "15"] }],
      highlight: { devices: ["dev15"], rows: [{ table: "log", row: 0 }] },
      verdict: { text: "15 devices, 1 address in the log", tone: "accent" },
    },
  ],
};

function HomeRouterFirstLookBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM6HomeRouterFirstLookData });
}

export const netM6HomeRouterFirstLook: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: HomeRouterFirstLookBeat,
};
