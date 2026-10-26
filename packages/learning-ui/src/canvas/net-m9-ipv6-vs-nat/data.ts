import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 9.3 beat 2: the same home network twice. With IPv4 and NAT the router
// rewrites the source of both requests to its outside address, 198.51.100.2
// (the lab showed the server seeing the router's outside address), so the
// server sees one address for two devices. With IPv6 nothing is rewritten, so
// the server sees 2001:db8:4a1:20::5c and 2001:db8:4a1:20::23. Public IPv4
// addresses come from the documentation ranges 198.51.100.0/24 and
// 203.0.113.0/24; the IPv6 ones are in 2001:db8::/32. The tables are model
// views, not recordings. The renderer is NetStepCanvas; the model is
// models/net-step.ts.
const TITLE = "The server sees each device itself";
const PURPOSE = "The same home network twice. With IPv4 and NAT the server sees one address for both devices. With IPv6 it sees each device's own address.";
const LIMITS =
  "A model with made-up devices and documentation addresses. The cards show the whole IPv4 address but only the end of each IPv6 address; the tables show what the server sees. The picture does not show NAT ports or timers, and the IPv6 side tested no real forwarding or router announcements.";

const request = (src: string, dst: string, changed?: boolean) => [
  { label: "src", value: src, ...(changed ? { changed: true } : {}) },
  { label: "dst", value: dst },
];

export const netM9Ipv6VsNatData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "phone", kind: "phone", label: "Phone", x: 70, y: 0, addresses: ["192.168.1.24", "::5c"] },
    { id: "laptop", kind: "host", label: "Laptop", x: 350, y: 0, addresses: ["192.168.1.23", "::23"] },
    { id: "router", kind: "router", label: "Router", x: 210, y: 110, addresses: ["198.51.100.2"] },
    { id: "server", kind: "server", label: "Server", x: 210, y: 220, addresses: ["203.0.113.80", "ffff::80"] },
  ],
  links: [
    { from: "phone", to: "router" },
    { from: "laptop", to: "router" },
    { from: "router", to: "server" },
  ],
  tables: [
    { id: "v4", title: "Server sees, IPv4 with NAT", device: "server", columns: ["Device", "Source seen"], rows: [] },
    { id: "v6", title: "Server sees, IPv6", device: "server", columns: ["Device", "Source seen"], rows: [] },
  ],
  steps: [
    {
      caption: "IPv4 first. At home the phone is 192.168.1.24 and the laptop is 192.168.1.23. The router's outside address is 198.51.100.2.",
      highlight: { devices: ["phone", "laptop", "router"] },
    },
    {
      caption: "The phone sends a request to the server. The source is the phone's private address.",
      packet: { at: 0, fields: request("192.168.1.24", "203.0.113.80") },
      highlight: { devices: ["phone"] },
    },
    {
      caption: "The router rewrites the source to its own outside address. The server sees 198.51.100.2.",
      packet: { at: 2, fields: request("198.51.100.2", "203.0.113.80", true) },
      highlight: { devices: ["router"], rows: [{ table: "v4", row: 0 }] },
      tableUpdates: [{ table: "v4", row: 0, cells: ["Phone", "198.51.100.2"] }],
    },
    {
      caption: "The laptop's request leaves the same way. The server sees the same address and cannot tell them apart by address.",
      packet: { at: 2, fields: request("198.51.100.2", "203.0.113.80", true) },
      highlight: { devices: ["laptop", "router"], rows: [{ table: "v4", row: 1 }] },
      tableUpdates: [{ table: "v4", row: 1, cells: ["Laptop", "198.51.100.2"] }],
      verdict: { text: "Two devices, one address", tone: "warn" },
    },
    {
      caption: "Now IPv6. Each device has its own global address, and no router rewrites anything.",
      highlight: { devices: ["phone", "laptop"] },
    },
    {
      caption: "The phone's request crosses the router unchanged. The server sees the phone's own address.",
      packet: { at: 2, fields: request("2001:db8:4a1:20::5c", "2001:db8:ffff::80") },
      highlight: { devices: ["phone"], rows: [{ table: "v6", row: 0 }] },
      tableUpdates: [{ table: "v6", row: 0, cells: ["Phone", "2001:db8:4a1:20::5c"] }],
    },
    {
      caption: "The laptop's request also crosses unchanged. The server sees a second address and can tell the devices apart.",
      packet: { at: 2, fields: request("2001:db8:4a1:20::23", "2001:db8:ffff::80") },
      highlight: { devices: ["laptop"], rows: [{ table: "v6", row: 1 }] },
      tableUpdates: [{ table: "v6", row: 1, cells: ["Laptop", "2001:db8:4a1:20::23"] }],
      verdict: { text: "Two devices, two addresses", tone: "good" },
    },
  ],
};

function Ipv6VsNatBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM9Ipv6VsNatData });
}

export const netM9Ipv6VsNat: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: Ipv6VsNatBeat,
};
