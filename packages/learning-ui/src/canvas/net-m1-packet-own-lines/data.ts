import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { PacketConfig } from "../net-m1-packet-dns/config";
import { PacketCanvas } from "../net-m1-packet-dns/PacketCanvas";
import {
  ARP_REQUEST_SEGMENTS,
  ECHO_REPLY_SEGMENTS,
  ECHO_REQUEST_SEGMENTS,
  PHONE_IP,
  arpRequestPacket,
  echoReplyPacket,
  echoRequestPacket,
} from "../net-m1-packet-dns/packets";

// 1.5 beat 4: the three real lines of the lab capture (recording
// cable-capture.txt: the ARP request, the echo request and the echo reply),
// each one a packet. Tap a line and the words that are fields light up, in the
// line and in the bands.
const TITLE = "Your capture lines, as packets";
const PURPOSE = "Tap one of three real capture lines to see which of its words are fields of the packet.";
const LIMITS =
  "The three lines are real, from the course lab, with the time at the start of each left off. Words that are not lit (length, id, flags) are fields this module does not need yet. Your own capture shows other numbers, such as your own MACs and a different id, in the same shape.";

export const netM1PacketOwnLinesConfig: PacketConfig = {
  mode: "lines",
  lines: [
    {
      id: "arp-request",
      title: "ARP request",
      what: `Your laptop asks everyone on the link, using the broadcast MAC, who has ${PHONE_IP}.`,
      segments: ARP_REQUEST_SEGMENTS,
      packet: arpRequestPacket(),
    },
    {
      id: "echo-request",
      title: "Echo request",
      what: "Your ping: an echo request from 192.168.1.10 to 192.168.1.20.",
      segments: ECHO_REQUEST_SEGMENTS,
      packet: echoRequestPacket(),
    },
    {
      id: "echo-reply",
      title: "Echo reply",
      what: "The phone's answer: an echo reply, with the addresses and the MACs swapped.",
      segments: ECHO_REPLY_SEGMENTS,
      packet: echoReplyPacket(),
    },
  ],
};

function PacketOwnLinesBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(PacketCanvas, { ...props, config: netM1PacketOwnLinesConfig });
}

export const netM1PacketOwnLines: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: PacketOwnLinesBeat,
};
