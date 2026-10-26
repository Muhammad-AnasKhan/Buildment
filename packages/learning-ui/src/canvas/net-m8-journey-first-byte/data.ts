import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { NetStepData } from "../models/net-step";
import { NetStepCanvas } from "../net-step/NetStepCanvas";

// 8.1 beat 7 (step 10 of the journey): the SYN went out and the SYN-ACK came
// back, so home1 sends the third message of the TCP handshake, an ACK, and both
// sides call the connection open (ss shows ESTAB on both sides in the lab
// run). Then home1 sends a plain HTTP request for the lab page, and the first
// byte of the answer arrives. The lab page /cgi-bin/whoami says "the server
// sees you as <address>:<port>". A real browser adds TLS, and often QUIC,
// before the request; the system design course covers both. The two routers in
// between are one link label here. The renderer is NetStepCanvas; the model is
// models/net-step.ts.
const TITLE = "The handshake ends and the page arrives";
const PURPOSE = "home1 sends the last handshake message, then the request. The first byte of the page comes back.";
const LIMITS =
  "Plain HTTP only, one packet at a time, no loss. A real browser adds TLS and often QUIC before the request, and the system design course covers both. The two routers between home1 and the server are drawn as one link. The state table is a simplified view of ss.";

const HOME1_IP = "192.168.1.101";

export const netM8JourneyFirstByteData: NetStepData = {
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  devices: [
    { id: "home1", kind: "host", label: "home1", x: 70, y: 0 },
    { id: "server", kind: "server", label: "server", x: 350, y: 0, addresses: ["203.0.113.80"] },
  ],
  links: [{ from: "home1", to: "server", label: "via 2 routers" }],
  tables: [
    {
      id: "state",
      title: "The connection",
      device: "home1",
      columns: ["Side", "State"],
      rows: [
        ["home1", "SYN sent"],
        ["server", "SYN-ACK sent"],
      ],
    },
  ],
  steps: [
    {
      caption: "The SYN went out and the SYN-ACK came back. home1 sends the third message, an ACK.",
      packet: {
        at: 0,
        fields: [
          { label: "src IP", value: HOME1_IP },
          { label: "dst IP", value: "203.0.113.80" },
          { label: "flags", value: "ACK" },
        ],
      },
      tableUpdates: [{ table: "state", row: 0, cells: ["home1", "ESTAB (open)"] }],
      highlight: { devices: ["home1"], rows: [{ table: "state", row: 0 }] },
    },
    {
      caption: "The ACK reaches the server. Both sides now agree the connection is open. No page data has moved yet.",
      tableUpdates: [{ table: "state", row: 1, cells: ["server", "ESTAB (open)"] }],
      highlight: { devices: ["server"], rows: [{ table: "state", row: 1 }] },
    },
    {
      caption: "home1 sends the request. On plain HTTP it is readable text: GET /cgi-bin/whoami.",
      packet: {
        at: 0,
        fields: [
          { label: "src IP", value: HOME1_IP },
          { label: "dst IP", value: "203.0.113.80" },
          { label: "dst port", value: "8080" },
          { label: "data", value: "GET /cgi-bin/whoami" },
        ],
      },
      highlight: { devices: ["home1"] },
    },
    {
      caption: "The server answers. The first byte of the page reaches home1. Ten small steps are done.",
      packet: {
        at: 0,
        reverse: true,
        fields: [
          { label: "src IP", value: "203.0.113.80" },
          { label: "dst IP", value: HOME1_IP },
          { label: "page says", value: "198.51.100.2:41000" },
        ],
      },
      highlight: { devices: ["server", "home1"] },
      verdict: { text: "First byte arrived", tone: "good" },
    },
    {
      caption: "A real browser adds TLS, and often QUIC, before the request. The system design course teaches both.",
      highlight: { devices: ["home1"] },
      verdict: { text: "This lab page is plain HTTP", tone: "warn" },
    },
  ],
};

function FirstByteBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(NetStepCanvas, { ...props, data: netM8JourneyFirstByteData });
}

export const netM8JourneyFirstByte: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: FirstByteBeat,
};
