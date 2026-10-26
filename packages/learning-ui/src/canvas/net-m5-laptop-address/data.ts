import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 5.3 beat 2: the phone (192.168.1.57) types the laptop's own address and the
// port, http://192.168.1.23:3000. The request now leaves the phone and reaches
// the laptop on the same Wi-Fi. In this picture the web app listens on every
// address of the laptop (0.0.0.0:3000), so it answers; the next beats show
// what changes when it does not. 0.0.0.0 appears only in the listening column,
// never as an address to browse to. The devices and addresses are made up
// (private range). The renderer is NetStepCanvas; the model is
// models/net-step.ts.
const TITLE = "Use the laptop's address instead";
const PURPOSE = "The phone types the laptop's own address and port. The request now leaves the phone and reaches the laptop.";
const LIMITS =
  "Two made-up devices on one Wi-Fi network, with a web app that listens on every address of the laptop in this picture. The table is a model of the laptop's listening sockets, not a recording. No firewall and no Wi-Fi client isolation are drawn: both can still block a request on a real network.";

const REQUEST = [
  { label: "from", value: "192.168.1.57" },
  { label: "to", value: "192.168.1.23:3000" },
];
const REPLY = [
  { label: "from", value: "192.168.1.23:3000" },
  { label: "to", value: "192.168.1.57" },
  { label: "data", value: "the page" },
];

export const netM5LaptopAddressData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "phone", kind: "phone", label: "Phone", x: 70, y: 0, addresses: ["192.168.1.57"] },
    { id: "laptop", kind: "host", label: "Laptop", x: 350, y: 0, addresses: ["192.168.1.23"] },
  ],
  links: [{ from: "phone", to: "laptop", label: "Wi-Fi" }],
  tables: [{ id: "listening", title: "Laptop is listening on", device: "laptop", columns: ["Address:port", "App"], rows: [["0.0.0.0:3000", "web app"]] }],
  steps: [
    {
      caption: "The phone is 192.168.1.57 and the laptop is 192.168.1.23. Both are on the same Wi-Fi network.",
      highlight: { devices: ["phone", "laptop"] },
    },
    {
      caption: "On the phone, type http://192.168.1.23:3000. This is the laptop's address, so the request leaves the phone.",
      packet: { at: 0, fields: REQUEST },
      highlight: { devices: ["phone"] },
    },
    {
      caption: "The request reaches the laptop's address, port 3000. Here the web app listens on every address.",
      highlight: { devices: ["laptop"], rows: [{ table: "listening", row: 0 }] },
    },
    {
      caption: "The web app answers, and the page opens on the phone. The request reached another computer.",
      packet: { at: 0, reverse: true, fields: REPLY },
      highlight: { devices: ["phone"] },
      verdict: { text: "The laptop's address reaches it", tone: "good" },
    },
  ],
};

function LaptopAddressBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM5LaptopAddressData });
}

export const netM5LaptopAddress: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: LaptopAddressBeat,
};
