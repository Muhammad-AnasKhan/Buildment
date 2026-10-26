import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { PacketConfig } from "../net-m1-packet-dns/config";
import { PacketCanvas } from "../net-m1-packet-dns/PacketCanvas";
import { OTHER_IP, PHONE_IP, echoRequestPacket, echoRequestToOtherPacket } from "../net-m1-packet-dns/packets";

// 1.5 beat 5: the same ping sent to a different computer. The first choice is
// the real echo request (recording echo-request.txt). The second, 192.168.1.30
// with the MAC 02:00:00:00:00:30, is made up and labelled so: only the
// destination address and the destination MAC differ.
const TITLE = "Ping another computer";
const PURPOSE = "Pick a different computer to ping and see which fields change and which stay the same.";
const LIMITS =
  "The first computer, 192.168.1.20, is the real capture. The second, 192.168.1.30 with its MAC 02:00:00:00:00:30, is made up for this picture. Fields this module does not teach (an identification number, checksums) are not drawn, and some of them change too.";

export const netM1PacketChangeConfig: PacketConfig = {
  mode: "change",
  initial: "ip-dst",
  options: [
    { id: "recorded", address: PHONE_IP, note: "recorded in the lab", packet: echoRequestPacket() },
    { id: "made-up", address: OTHER_IP, note: "made up, not recorded", packet: echoRequestToOtherPacket() },
  ],
};

function PacketChangeBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(PacketCanvas, { ...props, config: netM1PacketChangeConfig });
}

export const netM1PacketChange: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: PacketChangeBeat,
};
