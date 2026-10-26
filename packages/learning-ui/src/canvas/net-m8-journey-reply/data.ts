import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 8.1 beat 6 (steps 7 to 9 of the journey): prouter forwards the SYN to the
// server (TTL 62: 64 at home1, minus one for each of the two routers; a
// capture across two routers showed ttl 62). The server sees only the source
// 198.51.100.2 and answers it. The reply returns by the same two routers,
// losing one more TTL at each (the server starts it at 64, so 63 after prouter
// and 62 after hrouter; these TTL values are derived from the default TTL and
// the router rule, not captured). hrouter finds the reply in its NAT table
// (conntrack -L shows it) and rewrites the destination back to home1. MACs are
// made up (02:...). The renderer is NetStepCanvas; the model is
// models/net-step.ts.
const TITLE = "The row sends the reply home";
const PURPOSE = "The server sees only 198.51.100.2. The reply comes back to hrouter, and its NAT table row sends it home to home1.";
const LIMITS =
  "Four made-up devices and made-up MACs. The TTL values follow the default TTL of 64 and one less per router, and are not a capture. The NAT table is a simplified view of conntrack -L. One packet at a time, no loss.";

const ROW = ["home1:41000", "198.51.100.2:41000"];

export const netM8JourneyReplyData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "home1", kind: "host", label: "home1", x: 70, y: 0 },
    { id: "hrouter", kind: "router", label: "hrouter", x: 350, y: 0, addresses: ["192.168.1.1", "198.51.100.2"] },
    { id: "prouter", kind: "router", label: "prouter", x: 350, y: 120, addresses: ["198.51.100.1", "203.0.113.1"] },
    { id: "server", kind: "server", label: "server", x: 70, y: 120, addresses: ["203.0.113.80"] },
  ],
  links: [
    { from: "home1", to: "hrouter" },
    { from: "hrouter", to: "prouter" },
    { from: "prouter", to: "server" },
  ],
  tables: [{ id: "nat", title: "hrouter's NAT table", device: "hrouter", columns: ["Inside", "Server sees"], rows: [ROW] }],
  steps: [
    {
      caption: "prouter forwards the SYN to the server. Both subnets are plugged into it. TTL is now 62.",
      packet: {
        at: 2,
        fields: [
          { label: "src IP", value: "198.51.100.2" },
          { label: "dst IP", value: "203.0.113.80" },
          { label: "dst MAC", value: "02:00:00:00:00:05", changed: true },
          { label: "TTL", value: "62", changed: true },
          { label: "src port", value: "41000" },
        ],
      },
      highlight: { devices: ["prouter", "server"], links: [2] },
    },
    {
      caption: "The server sees source 198.51.100.2 and TTL 62. It has never heard of 192.168.1.101.",
      highlight: { devices: ["server"] },
      verdict: { text: "The server sees one address", tone: "accent" },
    },
    {
      caption: "The server answers 198.51.100.2, the only address it knows. The SYN-ACK goes back to prouter.",
      packet: {
        at: 2,
        reverse: true,
        fields: [
          { label: "src IP", value: "203.0.113.80" },
          { label: "dst IP", value: "198.51.100.2" },
          { label: "TTL", value: "64" },
          { label: "dst port", value: "41000" },
          { label: "flags", value: "SYN-ACK" },
        ],
      },
      highlight: { devices: ["server"], links: [2] },
    },
    {
      caption: "prouter forwards the reply along the connected /30 link. TTL is 63 now.",
      packet: {
        at: 1,
        reverse: true,
        fields: [
          { label: "src IP", value: "203.0.113.80" },
          { label: "dst IP", value: "198.51.100.2" },
          { label: "dst MAC", value: "02:00:00:00:00:02", changed: true },
          { label: "TTL", value: "63", changed: true },
          { label: "flags", value: "SYN-ACK" },
        ],
      },
      highlight: { devices: ["prouter", "hrouter"], links: [1] },
    },
    {
      caption: "hrouter finds the reply in its NAT table, which conntrack -L shows. The row says: home1, port 41000.",
      highlight: { devices: ["hrouter"], rows: [{ table: "nat", row: 0 }] },
    },
    {
      caption: "hrouter changes the destination back to 192.168.1.101 and sends the reply home. TTL is 62.",
      packet: {
        at: 0,
        reverse: true,
        fields: [
          { label: "src IP", value: "203.0.113.80" },
          { label: "dst IP", value: "192.168.1.101", changed: true },
          { label: "dst MAC", value: "02:00:00:00:00:11", changed: true },
          { label: "TTL", value: "62", changed: true },
          { label: "flags", value: "SYN-ACK" },
        ],
      },
      highlight: { devices: ["hrouter", "home1"], links: [0], rows: [{ table: "nat", row: 0 }] },
      verdict: { text: "The row sent the reply home", tone: "good" },
    },
  ],
};

function ReplyBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM8JourneyReplyData });
}

export const netM8JourneyReply: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: ReplyBeat,
};
