import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { PacketConfig } from "../net-m1-packet-dns/config";
import { PacketCanvas } from "../net-m1-packet-dns/PacketCanvas";
import { webRequestPacket } from "../net-m1-packet-dns/packets";

// 1.6 beat 3: the same made-up web request as net-m1-packet-jobs, built from
// the inside out: the message, then TCP, then IP, then Ethernet last. Tap the
// next header to add it; a header out of order is refused with the reason.
const TITLE = "Wrap a message, outermost last";
const PURPOSE = "Add the three headers in order and watch the packet grow outward. The wrong order is refused, with the reason.";
const LIMITS =
  "A made-up web request with fictional MACs and addresses. The order shown is the one a sender follows for TCP over IP over Ethernet; real packets can carry other headers too. Wi-Fi uses a different link header; the lab uses Ethernet.";

export const netM1PacketWrapConfig: PacketConfig = { mode: "wrap", packet: webRequestPacket() };

function PacketWrapBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(PacketCanvas, { ...props, config: netM1PacketWrapConfig });
}

export const netM1PacketWrap: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: PacketWrapBeat,
};
