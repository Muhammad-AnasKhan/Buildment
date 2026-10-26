import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { PacketConfig } from "../net-m1-packet-dns/config";
import { PacketCanvas } from "../net-m1-packet-dns/PacketCanvas";
import { WEB_NEXT_HOP_MAC, WEB_ROUTER_OUT_MAC, webRequestPacket } from "../net-m1-packet-dns/packets";

// 1.6 beat 4: the made-up web request reaches a router. The router takes off
// only the outer Ethernet header, reads the IP header, lowers TTL by one (64
// becomes 63) and wraps a new Ethernet header for the next link. The router's
// two MACs and the next device's MAC are fictional (first byte 02).
const TITLE = "A router opens only the outer layer";
const PURPOSE = "Step a packet through a router: strip the Ethernet header, read the IP header, then add a new Ethernet header.";
const LIMITS =
  "One router and made-up MACs. A real router also looks up the next device in its routing table (module 4) and drops a packet whose TTL would reach 0; this picture shows neither. Wi-Fi uses a different link header; the lab uses Ethernet.";

export const netM1PacketUnwrapConfig: PacketConfig = {
  mode: "unwrap",
  packet: webRequestPacket(),
  hop: { srcMac: WEB_ROUTER_OUT_MAC, dstMac: WEB_NEXT_HOP_MAC },
};

function PacketUnwrapBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(PacketCanvas, { ...props, config: netM1PacketUnwrapConfig });
}

export const netM1PacketUnwrap: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: PacketUnwrapBeat,
};
