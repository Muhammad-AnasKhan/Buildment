import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { PacketConfig } from "./config";
import { PacketCanvas } from "./PacketCanvas";
import { dnsQueryPacket } from "./packets";

// 1.5 beat 2: a real DNS query from the course lab (recording dns-query.txt):
// dig on the laptop asking the phone's DNS server for web.test. Tap a field to
// see what it is, who set it and which module explains it. The renderer is
// the PacketCanvas component in this folder; the model is models/net-packet.ts.
const TITLE = "A DNS query, field by field";
const PURPOSE = "Tap any field of a real DNS query to see what it is, who set it and which module explains it.";
const LIMITS =
  "One real query captured in the course lab: dig on the laptop asking the phone's DNS server for web.test. A real packet has more fields (an identification number, flags, checksums, the DNS header); only the ones this module needs are drawn. Ports are explained in module 5 and DNS in module 7.";

export const netM1PacketDnsConfig: PacketConfig = {
  mode: "inspect",
  packet: dnsQueryPacket(),
  initial: "udp-dport",
  verdict: "Two addresses, two ports, one TTL",
};

function PacketDnsBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(PacketCanvas, { ...props, config: netM1PacketDnsConfig });
}

export const netM1PacketDns: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: PacketDnsBeat,
};
