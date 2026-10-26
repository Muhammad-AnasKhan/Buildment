import { makeLayer, type CaptureSegment, type Packet, type PacketField, type PacketLayer } from "../models/net-packet";

// The packets the net-m1 canvases draw. The first group is REAL: values come
// from the lab recordings in agent-ip/work/networking/recordings/
// (cable-capture.txt, echo-request.txt, dns-query.txt, recorded 2026-10-26;
// the lab's random locally administered MACs). Header fields were decoded
// from the hex dumps and checked against the tcpdump -v lines; the test in
// frontend/tests/unit/canvas/net-packet.test.ts decodes the same hex again.
// The second group is FICTIONAL (the jobs, wrap and unwrap pictures): MACs
// whose first byte is 02 (locally administered) and documentation-range
// public addresses, so nothing here can be a real device.
//
// Field explanations stay inside what module 1 teaches: ports are module 5,
// MAC and ARP module 3, IP addresses module 2, routers and TTL module 4, DNS
// module 7. TTL is set by the sending computer's operating system, 64 by
// default on Linux (source S28 in the dossier).

// ---------------------------------------------------------------- recorded values

/** Lab laptop and phone: 192.168.1.10/24 and 192.168.1.20/24 (cable-capture.txt header). */
export const LAPTOP_IP = "192.168.1.10";
export const PHONE_IP = "192.168.1.20";
export const LAPTOP_MAC = "a2:bb:8c:3a:32:03";
export const PHONE_MAC = "da:dc:29:fd:5e:bf";
export const BROADCAST_MAC = "ff:ff:ff:ff:ff:ff";

// ---------------------------------------------------------------- fictional values

/** Made-up second computer for the "change" picture (locally administered). */
export const OTHER_IP = "192.168.1.30";
export const OTHER_MAC = "02:00:00:00:00:30";

/** The made-up web request of 1.6: laptop .23, a router, a server in the documentation range 203.0.113.0/24. */
export const WEB_LAPTOP_IP = "192.168.1.23";
export const WEB_SERVER_IP = "203.0.113.80";
export const WEB_LAPTOP_MAC = "02:00:00:00:00:23";
export const WEB_ROUTER_IN_MAC = "02:00:00:00:00:01";
export const WEB_ROUTER_OUT_MAC = "02:00:00:00:00:02";
export const WEB_NEXT_HOP_MAC = "02:00:00:00:00:03";
export const WEB_SOURCE_PORT = "40000";
export const WEB_SERVER_PORT = "80";

// ---------------------------------------------------------------- field builders

const field = (id: string, label: string, value: string, what: string, who: string, module: number | null, absent?: boolean): PacketField => ({
  id,
  label,
  value,
  what,
  who,
  module,
  ...(absent ? { absent } : {}),
});

type EthernetOptions = {
  dst: string;
  src: string;
  type: string;
  dstWhat?: string;
  dstWho: string;
  srcWho: string;
  dstModule?: number;
  typeWhat?: string;
};

function ethernet(o: EthernetOptions): PacketLayer {
  return makeLayer(
    "ethernet",
    [
      field("eth-dst", "destination MAC", o.dst, o.dstWhat ?? "The hardware address of the next device on this link.", o.dstWho, o.dstModule ?? 3),
      field("eth-src", "source MAC", o.src, "The hardware address of the network card that put the packet on this link.", o.srcWho, 3),
      field("eth-type", "type", o.type, o.typeWhat ?? "Says what comes next in the packet: here an IPv4 packet (0x0800).", "the sending computer's network software", 1),
    ],
    ["eth-dst", "eth-src"]
  );
}

type IpOptions = { src: string; dst: string; proto: string; srcWho: string; dstWho: string; protoWho: string; protoModule: number; ttlWho?: string };

function ip(o: IpOptions): PacketLayer {
  return makeLayer(
    "ip",
    [
      field("ip-src", "source address", o.src, "The address of the computer that sent the packet.", o.srcWho, 2),
      field("ip-dst", "destination address", o.dst, "The address of the computer the packet is going to.", o.dstWho, 2),
      field("ip-ttl", "TTL", "64", "How many more routers may pass the packet on. Each router lowers it by one.", o.ttlWho ?? "your laptop's operating system (64 by default on Linux)", 4),
      field("ip-proto", "protocol", o.proto, "Says what kind of message is inside the IP packet.", o.protoWho, o.protoModule),
    ],
    ["ip-src", "ip-dst"]
  );
}

// ---------------------------------------------------------------- recorded: DNS query

/** dns-query.txt: dig +short @192.168.1.20 web.test, from the laptop to the phone's DNS server. */
export function dnsQueryPacket(): Packet {
  return {
    layers: [
      ethernet({
        dst: PHONE_MAC,
        src: LAPTOP_MAC,
        type: "IPv4 (0x0800)",
        dstWho: "your laptop, which learned it with ARP",
        srcWho: "your laptop's network card",
      }),
      ip({
        src: LAPTOP_IP,
        dst: PHONE_IP,
        proto: "UDP (17)",
        srcWho: "your laptop, which writes its own address here",
        dstWho: "you: the address you gave dig (@192.168.1.20)",
        protoWho: "the program: dig sends its question over UDP",
        protoModule: 5,
      }),
      makeLayer(
        "udp",
        [
          field("udp-sport", "source port", "37028", "The number that names the app on the sending computer.", "your laptop's operating system, which picks a free number for the app", 5),
          field("udp-dport", "destination port", "53", "The number that names the app on the receiving computer. DNS servers listen on 53.", "the program: dig asks the port where a DNS server listens", 5),
        ],
        ["udp-sport", "udp-dport"]
      ),
    ],
    payload: field("payload", "DNS question", "A? web.test.", "The question itself: what is the address (A) of the name web.test?", "dig, the program that asked", 7),
  };
}

// ---------------------------------------------------------------- recorded: ping and ARP

const echoIcmp = (type: "echo request" | "echo reply", who: string): PacketLayer =>
  makeLayer("icmp", [
    field(
      "icmp-type",
      "type",
      type,
      type === "echo request" ? "Says what kind of ICMP message this is: here a ping asking \"are you there?\"" : "Says what kind of ICMP message this is: here the answer to a ping.",
      who,
      1
    ),
    // ICMP has no port. The slot is drawn greyed so the learner sees what a DNS query has and a ping lacks.
    field("icmp-port", "port", "none", "ICMP has no ports. A ping goes to a computer, not to an app on it.", "no one: the field does not exist", 5, true),
  ]);

/** echo-request.txt (and cable-capture.txt line 3): ping -c 1 192.168.1.20 from the laptop. */
export function echoRequestPacket(): Packet {
  return {
    layers: [
      ethernet({ dst: PHONE_MAC, src: LAPTOP_MAC, type: "IPv4 (0x0800)", dstWho: "your laptop, which learned it with ARP", srcWho: "your laptop's network card" }),
      ip({
        src: LAPTOP_IP,
        dst: PHONE_IP,
        proto: "ICMP (1)",
        srcWho: "your laptop, which writes its own address here",
        dstWho: "you: the address you gave ping",
        protoWho: "the program: ping uses ICMP",
        protoModule: 1,
      }),
      echoIcmp("echo request", "the ping program"),
    ],
    payload: field("payload", "data", "56 bytes", "What the ping carries: 56 bytes of filler.", "the ping program", null),
  };
}

/** cable-capture.txt line 4: the phone's echo reply, same ping. */
export function echoReplyPacket(): Packet {
  return {
    layers: [
      ethernet({ dst: LAPTOP_MAC, src: PHONE_MAC, type: "IPv4 (0x0800)", dstWho: "the phone, which got your laptop's MAC from the request", srcWho: "the phone's network card" }),
      ip({
        src: PHONE_IP,
        dst: LAPTOP_IP,
        proto: "ICMP (1)",
        srcWho: "the phone, which writes its own address here",
        dstWho: "the phone, which sends the answer back to the sender",
        protoWho: "the phone's operating system: it answers a ping with ICMP",
        protoModule: 1,
        ttlWho: "the phone's operating system (64 by default on Linux)",
      }),
      echoIcmp("echo reply", "the phone's operating system"),
    ],
    payload: field("payload", "data", "56 bytes", "What the ping carries: 56 bytes of filler.", "the ping program", null),
  };
}

/** cable-capture.txt line 1: the ARP request, to the broadcast MAC. */
export function arpRequestPacket(): Packet {
  return {
    layers: [
      ethernet({
        dst: BROADCAST_MAC,
        src: LAPTOP_MAC,
        type: "ARP (0x0806)",
        dstWhat: "The broadcast address: every device on this link receives the packet.",
        dstWho: "your laptop, which does not know the phone's MAC yet",
        srcWho: "your laptop's network card",
        dstModule: 1,
        typeWhat: "Says what comes next in the packet: here an ARP message (0x0806).",
      }),
      makeLayer("arp", [
        field("arp-op", "operation", "request", "Says whether this ARP message asks or answers.", "your laptop", 3),
        field("arp-target", "who has", PHONE_IP, "The address your laptop wants a MAC for.", "your laptop, which knows only the IP address so far", 3),
        field("arp-sender", "tell", LAPTOP_IP, "The address to send the answer to.", "your laptop", 3),
      ]),
    ],
    payload: field("payload", "data", "none", "An ARP message carries nothing after its own fields.", "no one", null),
  };
}

// ---------------------------------------------------------------- recorded lines

/**
 * The three recorded capture lines of cable-capture.txt, as tcpdump printed
 * them without the leading timestamp. The segments, joined by single spaces,
 * are exactly the line; a segment that is a field names it.
 */
export const ARP_REQUEST_SEGMENTS: CaptureSegment[] = [
  { text: LAPTOP_MAC, field: "eth-src" },
  { text: ">" },
  { text: `${BROADCAST_MAC},`, field: "eth-dst" },
  { text: "ethertype ARP (0x0806),", field: "eth-type" },
  { text: "length 42: Ethernet (len 6), IPv4 (len 4)," },
  { text: "Request", field: "arp-op" },
  { text: `who-has ${PHONE_IP}`, field: "arp-target" },
  { text: `tell ${LAPTOP_IP},`, field: "arp-sender" },
  { text: "length 28" },
];

export const ECHO_REQUEST_SEGMENTS: CaptureSegment[] = [
  { text: LAPTOP_MAC, field: "eth-src" },
  { text: ">" },
  { text: `${PHONE_MAC},`, field: "eth-dst" },
  { text: "ethertype IPv4 (0x0800),", field: "eth-type" },
  { text: "length 98: (tos 0x0," },
  { text: "ttl 64,", field: "ip-ttl" },
  { text: "id 12923, offset 0, flags [DF]," },
  { text: "proto ICMP (1),", field: "ip-proto" },
  { text: "length 84)" },
  { text: LAPTOP_IP, field: "ip-src" },
  { text: ">" },
  { text: `${PHONE_IP}:`, field: "ip-dst" },
  { text: "ICMP echo request,", field: "icmp-type" },
  { text: "id 584, seq 1, length 64" },
];

export const ECHO_REPLY_SEGMENTS: CaptureSegment[] = [
  { text: PHONE_MAC, field: "eth-src" },
  { text: ">" },
  { text: `${LAPTOP_MAC},`, field: "eth-dst" },
  { text: "ethertype IPv4 (0x0800),", field: "eth-type" },
  { text: "length 98: (tos 0x0," },
  { text: "ttl 64,", field: "ip-ttl" },
  { text: "id 54500, offset 0, flags [none]," },
  { text: "proto ICMP (1),", field: "ip-proto" },
  { text: "length 84)" },
  { text: PHONE_IP, field: "ip-src" },
  { text: ">" },
  { text: `${LAPTOP_IP}:`, field: "ip-dst" },
  { text: "ICMP echo reply,", field: "icmp-type" },
  { text: "id 584, seq 1, length 64" },
];

// ---------------------------------------------------------------- fictional: the second computer

/** The same ping sent to a made-up second computer: only the destination address and its MAC differ. */
export function echoRequestToOtherPacket(): Packet {
  const base = echoRequestPacket();
  const edit = (p: Packet, id: string, value: string, who: string): Packet => ({
    layers: p.layers.map((l) => ({ ...l, fields: l.fields.map((f) => (f.id === id ? { ...f, value, who } : f)) })),
    payload: p.payload,
  });
  const withIp = edit(base, "ip-dst", OTHER_IP, "you: the address you gave ping");
  return edit(withIp, "eth-dst", OTHER_MAC, "your laptop, which learned it with ARP (a made-up MAC)");
}

// ---------------------------------------------------------------- fictional: the web request

const WEB_MESSAGE = field("payload", "web request", "GET /", "The message itself: here a request for a web page.", "your browser", null);

/** 1.6: 192.168.1.23 port 40000 to 203.0.113.80 port 80, leaving through the router. All values made up. */
export function webRequestPacket(): Packet {
  return {
    layers: [
      ethernet({
        dst: WEB_ROUTER_IN_MAC,
        src: WEB_LAPTOP_MAC,
        type: "IPv4 (0x0800)",
        dstWhat: "The hardware address of the next device on this link. Here that is the router, not the server.",
        dstWho: "your laptop, which learned the router's MAC with ARP",
        srcWho: "your laptop's network card",
      }),
      ip({
        src: WEB_LAPTOP_IP,
        dst: WEB_SERVER_IP,
        proto: "TCP (6)",
        srcWho: "your laptop, which writes its own address here",
        dstWho: "your browser, which was given the server's address",
        protoWho: "the program: web pages travel over TCP",
        protoModule: 5,
      }),
      makeLayer(
        "tcp",
        [
          field("tcp-sport", "source port", WEB_SOURCE_PORT, "The number that names the app on the sending computer.", "your laptop's operating system, which picks a free number for the app", 5),
          field("tcp-dport", "destination port", WEB_SERVER_PORT, "The number that names the app on the receiving computer.", "the program: it is asking for a web page, and web servers listen on port 80", 5),
        ],
        ["tcp-sport", "tcp-dport"]
      ),
    ],
    payload: WEB_MESSAGE,
  };
}
