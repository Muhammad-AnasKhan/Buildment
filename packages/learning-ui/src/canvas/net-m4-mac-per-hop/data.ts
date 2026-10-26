import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 4.2 beat 4: one packet from the laptop (192.168.1.23) to the server
// (203.0.113.80) over three links: laptop to R1, R1 to R2, R2 to server. On
// every link the source and destination IP addresses stay the same, and the
// MAC pair is new, because each router builds a fresh frame for the next link.
// On the last link the destination MAC is the server's own, since the server
// is on that link. No NAT. The devices, addresses and MACs are made up
// (locally administered, 02:...); public addresses come from the
// documentation ranges. The renderer is NetStepCanvas; the model is
// models/net-step.ts.
const TITLE = "The MAC pair changes on every link";
const PURPOSE = "One packet crosses three links. The IP addresses stay the same, and each link has its own source MAC and destination MAC.";
const LIMITS =
  "Made-up devices and MACs on Ethernet links, IPv4 only, two routers, no NAT: a real home router also rewrites the source IP address, and module 6 shows that on purpose. Real links may have switches between the devices, which are left out. Wi-Fi frames look different.";

const LAPTOP_MAC = "02:00:00:00:01:23";
const R1_INSIDE_MAC = "02:00:00:00:01:01";
const R1_OUTSIDE_MAC = "02:00:00:00:02:02";
const R2_INSIDE_MAC = "02:00:00:00:02:01";
const R2_OUTSIDE_MAC = "02:00:00:00:03:01";
const SERVER_MAC = "02:00:00:00:03:80";

const IPS = [
  { label: "src IP", value: "192.168.1.23" },
  { label: "dst IP", value: "203.0.113.80" },
];

export const netM4MacPerHopData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "laptop", kind: "host", label: "Laptop", x: 70, y: 0, addresses: ["192.168.1.23"] },
    { id: "r1", kind: "router", label: "R1", x: 350, y: 0, addresses: ["192.168.1.1", "198.51.100.2"] },
    { id: "r2", kind: "router", label: "R2", x: 350, y: 110, addresses: ["198.51.100.1", "203.0.113.1"] },
    { id: "server", kind: "server", label: "Server", x: 70, y: 110, addresses: ["203.0.113.80"] },
  ],
  links: [
    { from: "laptop", to: "r1", label: "link 1" },
    { from: "r1", to: "r2", label: "link 2" },
    { from: "r2", to: "server", label: "link 3" },
  ],
  steps: [
    {
      caption: "Link 1: the laptop sends the frame to R1's inside MAC. The IPs name the laptop and the server.",
      packet: {
        at: 0,
        fields: [{ label: "src MAC", value: LAPTOP_MAC }, { label: "dst MAC", value: R1_INSIDE_MAC }, ...IPS],
      },
      highlight: { links: [0] },
    },
    {
      caption: "R1 reads the destination IP, picks R2 as the next hop, and builds a new frame for link 2.",
      packet: {
        at: 1,
        fields: [
          { label: "src MAC", value: R1_OUTSIDE_MAC, changed: true },
          { label: "dst MAC", value: R2_INSIDE_MAC, changed: true },
          ...IPS,
        ],
      },
      highlight: { links: [1], devices: ["r1"] },
    },
    {
      caption: "R2 finds the server on its own link, so the destination MAC is the server's. The IPs have not changed.",
      packet: {
        at: 2,
        fields: [
          { label: "src MAC", value: R2_OUTSIDE_MAC, changed: true },
          { label: "dst MAC", value: SERVER_MAC, changed: true },
          ...IPS,
        ],
      },
      highlight: { links: [2], devices: ["r2"] },
      pick: {
        prompt: "R2 builds the last frame. Which destination MAC does it use on link 3?",
        options: [
          { label: "R2's own MAC", correct: false, why: "A frame is sent to another device, not to the sender. R2 is the one sending it." },
          { label: "R1's MAC", correct: false, why: "R1 is on link 2, behind R2. Link 3 only has R2 and the server on it." },
          { label: "The server's MAC", correct: true, why: "The server is on link 3, so it is the next device. It is also the final destination." },
        ],
      },
    },
    {
      caption: "Three links, three MAC pairs. The source IP and destination IP never changed.",
      highlight: { links: [0, 1, 2] },
      verdict: { text: "A new MAC pair on every link", tone: "good" },
    },
  ],
};

function MacPerHopBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM4MacPerHopData });
}

export const netM4MacPerHop: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: MacPerHopBeat,
};
