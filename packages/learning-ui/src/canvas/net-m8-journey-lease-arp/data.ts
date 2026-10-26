import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 8.1 beat 2 (steps 1 and 2 of the journey): home1 joins the capstone home
// network with no address. It broadcasts a DHCP Discover from 0.0.0.0 to
// 255.255.255.255 (ports 68 to 67), the router's dnsmasq offers and confirms
// 192.168.1.101/24 with gateway and DNS 192.168.1.1 and a one hour lease, and
// then home1 asks everyone with ARP for the MAC of its gateway. The field order
// and words follow the recorded DHCP capture (Discover, Offer, Request, ACK on
// ports 67 and 68) and the lease line of the capstone part 3 run. The address
// 192.168.1.101 is one possible lease from the pool 192.168.1.100 to
// 192.168.1.150; a real run picks its own. MACs are made up (02:...). The
// renderer is NetStepCanvas; the model is models/net-step.ts.
const TITLE = "A lease, then the router's MAC";
const PURPOSE = "home1 starts with no address. One DHCP lease gives it an address, a gateway and a DNS server. Then ARP finds the router's MAC.";
const LIMITS =
  "Two devices and made-up MACs. The offered address, 192.168.1.101, is one possible lease from the pool 192.168.1.100 to 192.168.1.150, and a real run picks its own. The tables are simplified views of ip addr, ip route and ip neigh. Renewing a lease and the lease timers are not drawn.";

const HOME1_MAC = "02:00:00:00:00:11";
const ROUTER_MAC = "02:00:00:00:00:01";

const ARP_REQUEST = [
  { label: "src MAC", value: HOME1_MAC },
  { label: "dst MAC", value: "ff:ff:ff:ff:ff:ff" },
  { label: "ARP", value: "request" },
  { label: "who has", value: "192.168.1.1" },
  { label: "tell", value: "192.168.1.101" },
];

export const netM8JourneyLeaseArpData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "home1", kind: "host", label: "home1", x: 70, y: 0 },
    { id: "hrouter", kind: "router", label: "hrouter", x: 350, y: 0, addresses: ["192.168.1.1"] },
  ],
  links: [{ from: "home1", to: "hrouter" }],
  tables: [
    {
      id: "settings",
      title: "home1's settings",
      device: "home1",
      columns: ["Setting", "Value"],
      rows: [
        ["Address", "none"],
        ["Gateway", "none"],
        ["DNS server", "none"],
        ["Lease", "none"],
      ],
    },
    { id: "arp", title: "home1's ARP table", device: "home1", columns: ["IP address", "MAC address"], rows: [] },
  ],
  steps: [
    {
      caption: "home1 has just joined the home network. It has no address, no gateway and no DNS server yet.",
      highlight: { devices: ["home1"], rows: [{ table: "settings", row: 0 }] },
    },
    {
      caption: "With no address, home1 shouts to everyone: DHCP Discover. The source is 0.0.0.0.",
      packet: {
        at: 0,
        fields: [
          { label: "src IP", value: "0.0.0.0" },
          { label: "dst IP", value: "255.255.255.255" },
          { label: "DHCP", value: "Discover" },
          { label: "ports", value: "68 to 67" },
        ],
      },
      highlight: { devices: ["home1"] },
    },
    {
      caption: "The router's dnsmasq offers 192.168.1.101. home1 then asks for exactly that address.",
      packet: {
        at: 0,
        reverse: true,
        fields: [
          { label: "src IP", value: "192.168.1.1" },
          { label: "dst IP", value: "192.168.1.101" },
          { label: "DHCP", value: "Offer" },
          { label: "ports", value: "67 to 68" },
        ],
      },
      highlight: { devices: ["hrouter"] },
    },
    {
      caption: "The router confirms with an ACK. home1 saves the lease: address, gateway, DNS and one hour.",
      packet: {
        at: 0,
        reverse: true,
        fields: [
          { label: "src IP", value: "192.168.1.1" },
          { label: "dst IP", value: "192.168.1.101" },
          { label: "DHCP", value: "ACK" },
          { label: "lease", value: "3600 seconds" },
        ],
      },
      tableUpdates: [
        { table: "settings", row: 0, cells: ["Address", "192.168.1.101/24"] },
        { table: "settings", row: 1, cells: ["Gateway", "192.168.1.1"] },
        { table: "settings", row: 2, cells: ["DNS server", "192.168.1.1"] },
        { table: "settings", row: 3, cells: ["Lease", "1 hour"] },
      ],
      highlight: {
        devices: ["home1"],
        rows: [
          { table: "settings", row: 0 },
          { table: "settings", row: 1 },
          { table: "settings", row: 2 },
        ],
      },
      verdict: { text: "One lease gave four settings", tone: "good" },
    },
    {
      caption: "Now home1 needs the router's MAC. It asks everyone: who has 192.168.1.1?",
      packet: { at: 0, fields: ARP_REQUEST },
      highlight: { devices: ["home1"] },
    },
    {
      caption: "The router replies straight to home1's MAC. home1 saves the answer in its ARP table.",
      packet: {
        at: 0,
        reverse: true,
        fields: [
          { label: "src MAC", value: ROUTER_MAC, changed: true },
          { label: "dst MAC", value: HOME1_MAC, changed: true },
          { label: "ARP", value: "reply", changed: true },
          { label: "192.168.1.1 is at", value: ROUTER_MAC, changed: true },
        ],
      },
      tableUpdates: [{ table: "arp", row: 0, cells: ["192.168.1.1", ROUTER_MAC] }],
      highlight: { devices: ["home1"], rows: [{ table: "arp", row: 0 }] },
      verdict: { text: "home1 now knows the router's MAC", tone: "good" },
    },
  ],
};

function LeaseArpBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM8JourneyLeaseArpData });
}

export const netM8JourneyLeaseArp: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: LeaseArpBeat,
};
