import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 9.3 beat 3: without NAT, a filter keeps strangers out. The phone's own
// request makes the stateful filter in the router write a note, so the server's
// reply passes. A new packet from the server that nobody asked for has no
// note and is dropped. This is the lab's model of a stateful filter, not a
// recording (IPv6 forwarding was not tested in the lab). Addresses are in the
// IPv6 documentation prefix 2001:db8::/32. The renderer is NetStepCanvas; the
// model is models/net-step.ts.
const TITLE = "A filter, not NAT, keeps strangers out";
const PURPOSE = "The phone asks and the reply comes in. A packet that nobody asked for is dropped by the filter. No NAT is involved.";
const LIMITS =
  "A model of one simple stateful filter with made-up devices in the documentation prefix 2001:db8::/32. Real home routers differ in what they filter by default. The picture does not show ports, timers or how the router builds its notes, and no real IPv6 forwarding was tested.";

const PHONE = "2001:db8:4a1:20::5c";
const SERVER = "2001:db8:ffff::80";

const fields = (src: string, dst: string) => [
  { label: "src", value: src },
  { label: "dst", value: dst },
];

export const netM9Ipv6FilterData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "phone", kind: "phone", label: "Phone", x: 210, y: 0, addresses: ["::5c"] },
    { id: "router", kind: "router", label: "Router", x: 210, y: 110 },
    { id: "server", kind: "server", label: "Server", x: 210, y: 210, addresses: ["ffff::80"] },
  ],
  links: [
    { from: "phone", to: "router" },
    { from: "router", to: "server" },
  ],
  tables: [{ id: "notes", title: "The filter's notes", device: "router", columns: ["Connection", "State"], rows: [] }],
  steps: [
    {
      caption: "The phone has a global address. A filter in the router decides what may reach it.",
      highlight: { devices: ["phone", "router"] },
    },
    {
      caption: "The phone sends a request to the server. The filter writes down this connection.",
      packet: { at: 0, fields: fields(PHONE, SERVER) },
      highlight: { devices: ["router"], rows: [{ table: "notes", row: 0 }] },
      tableUpdates: [{ table: "notes", row: 0, cells: ["phone to server", "remembered"] }],
    },
    {
      caption: "The request goes on to the server. No address was changed on the way.",
      packet: { at: 1, fields: fields(PHONE, SERVER) },
      highlight: { devices: ["server"] },
    },
    {
      caption: "The server answers. The filter finds its note, so the reply is let in.",
      packet: { at: 1, reverse: true, fields: fields(SERVER, PHONE) },
      highlight: { devices: ["router"], rows: [{ table: "notes", row: 0 }] },
      tableUpdates: [{ table: "notes", row: 0, cells: ["phone to server", "reply let in"] }],
    },
    {
      caption: "The reply reaches the phone.",
      packet: { at: 0, reverse: true, fields: fields(SERVER, PHONE) },
      highlight: { devices: ["phone"] },
    },
    {
      caption: "The server now sends a new packet to the phone. Nobody asked for it, so the filter has no note.",
      packet: { at: 1, reverse: true, fields: fields(SERVER, PHONE) },
      highlight: { devices: ["router"], rows: [{ table: "notes", row: 1 }] },
      tableUpdates: [{ table: "notes", row: 1, cells: ["server to phone", "no note"] }],
      verdict: { text: "Dropped: nobody asked for it", tone: "good" },
      pick: {
        prompt: "A packet from the server arrives at the filter. The phone never asked for it. What does the filter do?",
        options: [
          { label: "Lets it in: address is global", correct: false, why: "A global address says where to send a packet. The filter, not the address, decides what may come in." },
          { label: "Drops it: nobody asked for it", correct: true, why: "The filter has no note for this packet, so nobody asked for it. It is dropped." },
          { label: "Swaps the address, as NAT does", correct: false, why: "Swapping addresses is the job of NAT, and there is no NAT here. The filter only lets a packet in or drops it." },
        ],
      },
    },
    {
      caption: "No NAT was involved. A filter alone keeps out packets that nobody asked for.",
      highlight: { devices: ["router"] },
      verdict: { text: "A filter, not NAT", tone: "accent" },
    },
  ],
};

function Ipv6FilterBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM9Ipv6FilterData });
}

export const netM9Ipv6Filter: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: Ipv6FilterBeat,
};
