import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { PacketConfig } from "../net-m1-packet-dns/config";
import { PacketCanvas } from "../net-m1-packet-dns/PacketCanvas";
import { webRequestPacket } from "../net-m1-packet-dns/packets";

// 1.6 beat 2: a made-up web request, 192.168.1.23 port 40000 to 203.0.113.80
// port 80 (a documentation-range address), with locally administered MACs.
// Three headers do three jobs: the Ethernet header reaches the next device on
// this link (MAC), the IP header reaches the far computer, the TCP header
// reaches one app (port). Tap a header to see its job and who reads it.
const TITLE = "Three headers, three jobs";
const PURPOSE = "Tap a header to see its job, the address it holds and who reads it.";
const LIMITS =
  "A made-up web request: the addresses, the MACs and port 40000 are fictional, and the server address is in the range kept for examples. Real TCP and IP headers hold more fields than the ones drawn here. Wi-Fi uses a different link header; the lab uses Ethernet.";

export const netM1PacketJobsConfig: PacketConfig = { mode: "jobs", packet: webRequestPacket() };

function PacketJobsBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(PacketCanvas, { ...props, config: netM1PacketJobsConfig });
}

export const netM1PacketJobs: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: PacketJobsBeat,
};
