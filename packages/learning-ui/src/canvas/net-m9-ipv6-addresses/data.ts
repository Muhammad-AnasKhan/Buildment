import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 9.3 beat 1: an IPv6 home network. The router announces one prefix,
// 2001:db8:4a1:20::/64. The phone and the laptop each add their own last part
// (::5c and ::23) and so each hold their own global address. The server is on
// another network, at 2001:db8:ffff::80. All addresses are in the IPv6
// documentation prefix 2001:db8::/32 (RFC 3849). The table is a model view,
// not a recording: router advertisements are not drawn. The renderer is
// NetStepCanvas; the model is models/net-step.ts.
const TITLE = "Every device has its own global address";
const PURPOSE = "A router announces one prefix. The phone and the laptop each add their own ending, so each has an address of its own.";
const LIMITS =
  "A model with made-up devices in the documentation prefix 2001:db8::/32. The cards show only the end of each address; the table shows the whole address. The picture does not draw how the router announces the prefix or how a device checks its address, and it tested no real IPv6 forwarding.";

export const netM9Ipv6AddressesData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "phone", kind: "phone", label: "Phone", x: 70, y: 0, addresses: ["::5c"] },
    { id: "laptop", kind: "host", label: "Laptop", x: 350, y: 0, addresses: ["::23"] },
    { id: "router", kind: "router", label: "Router", x: 210, y: 110 },
    { id: "server", kind: "server", label: "Server", x: 210, y: 220, addresses: ["ffff::80"] },
  ],
  links: [
    { from: "phone", to: "router" },
    { from: "laptop", to: "router" },
    { from: "router", to: "server" },
  ],
  tables: [{ id: "addr", title: "Who has which address", device: "router", columns: ["Name", "Address"], rows: [] }],
  steps: [
    {
      caption: "The router announces one prefix for the home network: 2001:db8:4a1:20::/64. Every device at home uses it.",
      highlight: { devices: ["router"], rows: [{ table: "addr", row: 0 }] },
      tableUpdates: [{ table: "addr", row: 0, cells: ["Prefix", "2001:db8:4a1:20::/64"] }],
    },
    {
      caption: "The phone adds its own ending, ::5c, to the prefix. Its global address is 2001:db8:4a1:20::5c.",
      highlight: { devices: ["phone"], links: [0], rows: [{ table: "addr", row: 1 }] },
      tableUpdates: [{ table: "addr", row: 1, cells: ["Phone", "2001:db8:4a1:20::5c"] }],
    },
    {
      caption: "The laptop adds ::23 to the same prefix. It has its own address too. The two share only the prefix.",
      highlight: { devices: ["laptop"], links: [1], rows: [{ table: "addr", row: 2 }] },
      tableUpdates: [{ table: "addr", row: 2, cells: ["Laptop", "2001:db8:4a1:20::23"] }],
    },
    {
      caption: "The server is on another network with another prefix. Its address is 2001:db8:ffff::80.",
      highlight: { devices: ["server"], links: [2], rows: [{ table: "addr", row: 3 }] },
      tableUpdates: [{ table: "addr", row: 3, cells: ["Server", "2001:db8:ffff::80"] }],
      verdict: { text: "Every device has its own address", tone: "good" },
    },
  ],
};

function Ipv6AddressesBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM9Ipv6AddressesData });
}

export const netM9Ipv6Addresses: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: Ipv6AddressesBeat,
};
