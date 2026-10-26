import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { PacketConfig } from "../net-m1-packet-dns/config";
import { PacketCanvas } from "../net-m1-packet-dns/PacketCanvas";
import { echoRequestPacket } from "../net-m1-packet-dns/packets";

// 1.5 beat 3: the real echo request from challenge 1 (recording
// echo-request.txt). Addresses, TTL and a type, and no port: the empty slot is
// drawn greyed so the learner sees what a DNS query has and a ping lacks.
const TITLE = "One ping, field by field";
const PURPOSE = "Tap any field of a real ping to see what it is and who set it, and find the port that is not there.";
const LIMITS =
  "One real echo request captured in the course lab. ICMP has no port field at all, so the greyed slot marks what is missing, not a real field. Other fields (an identification number, flags, checksums, the ping's sequence number) are left out.";

export const netM1PacketEchoConfig: PacketConfig = {
  mode: "inspect",
  packet: echoRequestPacket(),
  initial: "ip-ttl",
  verdict: "Two addresses, a TTL, a type: no port",
};

function PacketEchoBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(PacketCanvas, { ...props, config: netM1PacketEchoConfig });
}

export const netM1PacketEcho: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: PacketEchoBeat,
};
