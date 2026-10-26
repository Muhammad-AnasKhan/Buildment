import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  LAYER_INFO,
  WRAP_NOTES,
  WRAP_ORDER,
  allFields,
  bandTitle,
  compare,
  fieldName,
  findField,
  isLocallyAdministered,
  isMac,
  layerOf,
  lineText,
  litFields,
  nextToWrap,
  packetSummary,
  routerHop,
  setField,
  tryWrap,
  unwrap,
  wrap,
  type Packet,
} from "@buildment/learning-ui/canvas/models/net-packet";
import {
  ARP_REQUEST_SEGMENTS,
  ECHO_REPLY_SEGMENTS,
  ECHO_REQUEST_SEGMENTS,
  WEB_LAPTOP_MAC,
  WEB_NEXT_HOP_MAC,
  WEB_ROUTER_IN_MAC,
  WEB_ROUTER_OUT_MAC,
  arpRequestPacket,
  dnsQueryPacket,
  echoReplyPacket,
  echoRequestPacket,
  echoRequestToOtherPacket,
  webRequestPacket,
} from "@buildment/learning-ui/canvas/net-m1-packet-dns/packets";
import { CHIP_H, MARGIN, NEST, OUTER_W, VIEW_W, WORD_CHAR_W, chipWidth, flowWords, layoutPacket, type PacketLayout } from "@buildment/learning-ui/canvas/net-m1-packet-dns/layout";
import type { PacketConfig } from "@buildment/learning-ui/canvas/net-m1-packet-dns/config";
import { netM1PacketDns, netM1PacketDnsConfig } from "@buildment/learning-ui/canvas/net-m1-packet-dns/data";
import { netM1PacketEcho, netM1PacketEchoConfig } from "@buildment/learning-ui/canvas/net-m1-packet-echo/data";
import { netM1PacketOwnLines, netM1PacketOwnLinesConfig } from "@buildment/learning-ui/canvas/net-m1-packet-own-lines/data";
import { netM1PacketChange, netM1PacketChangeConfig } from "@buildment/learning-ui/canvas/net-m1-packet-change/data";
import { netM1PacketJobs, netM1PacketJobsConfig } from "@buildment/learning-ui/canvas/net-m1-packet-jobs/data";
import { netM1PacketWrap, netM1PacketWrapConfig } from "@buildment/learning-ui/canvas/net-m1-packet-wrap/data";
import { netM1PacketUnwrap, netM1PacketUnwrapConfig } from "@buildment/learning-ui/canvas/net-m1-packet-unwrap/data";
import { netM1SceneBroadcastMac } from "@buildment/learning-ui/canvas/net-m1-scene-broadcast-mac/data";
import { InteractiveCanvas } from "@buildment/learning-ui/canvas/InteractiveCanvas";
import { canvasRegistry } from "@buildment/learning-ui/canvas/registry";
import { loopTime, sceneFrame } from "@buildment/learning-ui/canvas/renderers/scene/frame";
import { actorsInside, chipTops, frameCollisions, MAX_SUB_CHARS } from "@buildment/learning-ui/canvas/renderers/scene/geometry";

// ---------------------------------------------------------------- the recordings
//
// The recordings are in agent-ip/work/networking/recordings/ (recorded
// 2026-10-26 in the course lab). The test does not read them from disk (the
// frontend test copy does not hold agent-ip), so their hex and text are
// copied here, each with the file it comes from. If a recording is replaced,
// replace these constants too.

/** echo-request.txt: `tcpdump -n -XX -i eth0 icmp -c 1`, lines 0x0000 to 0x0060 of the echo request. */
const ECHO_HEX = [
  "dadc 29fd 5ebf a2bb 8c3a 3203 0800 4500",
  "0054 327b 4000 4001 84bf c0a8 010a c0a8",
  "0114 0800 cc73 0248 0001 b461 de6a 0000",
  "0000 cea3 0900 0000 0000 1011 1213 1415",
  "1617 1819 1a1b 1c1d 1e1f 2021 2223 2425",
  "2627 2829 2a2b 2c2d 2e2f 3031 3233 3435",
  "3637",
];

/** dns-query.txt, section "hex of dns query": the DNS query, lines 0x0000 to 0x0050. */
const DNS_HEX = [
  "dadc 29fd 5ebf a2bb 8c3a 3203 0800 4500",
  "004d 1670 0000 4011 e0c1 c0a8 010a c0a8",
  "0114 90a4 0035 0039 83b9 7ac7 0120 0001",
  "0000 0000 0001 0377 6562 0474 6573 7400",
  "0001 0001 0000 2904 d000 0000 0000 0c00",
  "0a00 0855 5628 7f97 eb30 de",
];

/** cable-capture.txt, lines 4 to 8 (the ARP request, then the echo request and the echo reply, each on two lines). */
const ARP_REQUEST_LINE =
  "20:08:20.632368 a2:bb:8c:3a:32:03 > ff:ff:ff:ff:ff:ff, ethertype ARP (0x0806), length 42: Ethernet (len 6), IPv4 (len 4), Request who-has 192.168.1.20 tell 192.168.1.10, length 28";
const ECHO_REQUEST_LINES = [
  "20:08:20.632402 a2:bb:8c:3a:32:03 > da:dc:29:fd:5e:bf, ethertype IPv4 (0x0800), length 98: (tos 0x0, ttl 64, id 12923, offset 0, flags [DF], proto ICMP (1), length 84)",
  "    192.168.1.10 > 192.168.1.20: ICMP echo request, id 584, seq 1, length 64",
];
const ECHO_REPLY_LINES = [
  "20:08:20.632932 da:dc:29:fd:5e:bf > a2:bb:8c:3a:32:03, ethertype IPv4 (0x0800), length 98: (tos 0x0, ttl 64, id 54500, offset 0, flags [none], proto ICMP (1), length 84)",
  "    192.168.1.20 > 192.168.1.10: ICMP echo reply, id 584, seq 1, length 64",
];
/** dns-query.txt, section "dns -n -v -e", the query (first two lines). */
const DNS_LINES = [
  "20:08:27.686764 a2:bb:8c:3a:32:03 > da:dc:29:fd:5e:bf, ethertype IPv4 (0x0800), length 91: (tos 0x0, ttl 64, id 5744, offset 0, flags [none], proto UDP (17), length 77)",
  "    192.168.1.10.37028 > 192.168.1.20.53: 31431+ [1au] A? web.test. (49)",
];

// ---------------------------------------------------------------- a small frame decoder

const bytesOf = (hex: string[]) => hex.join(" ").split(/\s+/).flatMap((w) => w.match(/../g) ?? []).map((h) => Number.parseInt(h, 16));
const mac = (b: number[], at: number) => b.slice(at, at + 6).map((x) => x.toString(16).padStart(2, "0")).join(":");
const ipv4 = (b: number[], at: number) => b.slice(at, at + 4).join(".");
const u16 = (b: number[], at: number) => b[at] * 256 + b[at + 1];

/** Ethernet II + IPv4 (no options) + UDP or ICMP, as far as this course draws them. */
function decode(hex: string[]) {
  const b = bytesOf(hex);
  const ihl = (b[14] & 0x0f) * 4;
  const proto = b[14 + 9];
  const l4 = 14 + ihl;
  const out = {
    dstMac: mac(b, 0),
    srcMac: mac(b, 6),
    ethertype: u16(b, 12),
    ihl,
    totalLength: u16(b, 16),
    ttl: b[14 + 8],
    proto,
    srcIp: ipv4(b, 14 + 12),
    dstIp: ipv4(b, 14 + 16),
    srcPort: 0,
    dstPort: 0,
    icmpType: -1,
    payloadLength: 0,
    question: "",
    questionType: 0,
  };
  if (proto === 17) {
    out.srcPort = u16(b, l4);
    out.dstPort = u16(b, l4 + 2);
    out.payloadLength = u16(b, l4 + 4) - 8;
    // The DNS question starts after the 12-byte DNS header: length-prefixed labels, then type and class.
    let at = l4 + 8 + 12;
    const labels: string[] = [];
    while (b[at] !== 0) {
      labels.push(String.fromCharCode(...b.slice(at + 1, at + 1 + b[at])));
      at += b[at] + 1;
    }
    out.question = `${labels.join(".")}.`;
    out.questionType = u16(b, at + 1);
  } else if (proto === 1) {
    out.icmpType = b[l4];
    out.payloadLength = out.totalLength - ihl - 8;
  }
  return out;
}

const value = (p: Packet, id: string) => findField(p, id)?.value;
const stripTime = (line: string) => line.replace(/^\d\d:\d\d:\d\d\.\d+ /, "");
const joinLines = (lines: string[]) => lines.map((l) => l.trim()).join(" ");
const EM_DASH = /\u2014/;

// ---------------------------------------------------------------- recorded packets match the recordings

describe("recorded packets match the recordings", () => {
  it("decodes the recorded echo request and finds the same values in the echo packet", () => {
    const f = decode(ECHO_HEX);
    expect(f).toMatchObject({ dstMac: "da:dc:29:fd:5e:bf", srcMac: "a2:bb:8c:3a:32:03", ethertype: 0x0800, ttl: 64, proto: 1, srcIp: "192.168.1.10", dstIp: "192.168.1.20", icmpType: 8, payloadLength: 56 });
    const p = echoRequestPacket();
    expect(value(p, "eth-dst")).toBe(f.dstMac);
    expect(value(p, "eth-src")).toBe(f.srcMac);
    expect(value(p, "eth-type")).toBe("IPv4 (0x0800)");
    expect(value(p, "ip-src")).toBe(f.srcIp);
    expect(value(p, "ip-dst")).toBe(f.dstIp);
    expect(value(p, "ip-ttl")).toBe(String(f.ttl));
    expect(value(p, "ip-proto")).toBe("ICMP (1)");
    expect(value(p, "icmp-type")).toBe("echo request");
    expect(value(p, "payload")).toBe(`${f.payloadLength} bytes`);
    expect(netM1PacketEchoConfig).toMatchObject({ mode: "inspect" });
    expect(netM1PacketEchoConfig.mode === "inspect" && value(netM1PacketEchoConfig.packet, "ip-ttl")).toBe("64");
  });

  it("decodes the recorded DNS query and finds the same values in the DNS packet", () => {
    const f = decode(DNS_HEX);
    expect(f).toMatchObject({ dstMac: "da:dc:29:fd:5e:bf", srcMac: "a2:bb:8c:3a:32:03", ethertype: 0x0800, ttl: 64, proto: 17, srcIp: "192.168.1.10", dstIp: "192.168.1.20", srcPort: 37028, dstPort: 53, question: "web.test.", questionType: 1 });
    const p = dnsQueryPacket();
    expect(value(p, "eth-dst")).toBe(f.dstMac);
    expect(value(p, "eth-src")).toBe(f.srcMac);
    expect(value(p, "ip-src")).toBe(f.srcIp);
    expect(value(p, "ip-dst")).toBe(f.dstIp);
    expect(value(p, "ip-ttl")).toBe(String(f.ttl));
    expect(value(p, "ip-proto")).toBe("UDP (17)");
    expect(value(p, "udp-sport")).toBe(String(f.srcPort));
    expect(value(p, "udp-dport")).toBe(String(f.dstPort));
    expect(value(p, "payload")).toBe(`${f.questionType === 1 ? "A" : "?"}? ${f.question}`);
    // The DNS message is 49 bytes: the UDP length minus its 8-byte header.
    expect(f.payloadLength).toBe(49);
  });

  it("agrees with the decoded tcpdump -v lines of the DNS query", () => {
    const line = joinLines(DNS_LINES);
    const m = /^\S+ (\S+) > (\S+), ethertype IPv4 \(0x0800\).*ttl (\d+).*proto UDP \(17\).* (\d+\.\d+\.\d+\.\d+)\.(\d+) > (\d+\.\d+\.\d+\.\d+)\.(\d+): \d+\+ \[1au\] A\? (\S+) \(49\)$/.exec(line);
    expect(m).not.toBeNull();
    const p = dnsQueryPacket();
    expect(m![1]).toBe(value(p, "eth-src"));
    expect(m![2]).toBe(value(p, "eth-dst"));
    expect(m![3]).toBe(value(p, "ip-ttl"));
    expect(m![4]).toBe(value(p, "ip-src"));
    expect(m![5]).toBe(value(p, "udp-sport"));
    expect(m![6]).toBe(value(p, "ip-dst"));
    expect(m![7]).toBe(value(p, "udp-dport"));
    expect(`A? ${m![8]}`).toBe(value(p, "payload"));
  });

  it("agrees with the decoded tcpdump -v lines of the echo request and reply", () => {
    const pattern = /^\S+ (\S+) > (\S+), ethertype IPv4 \(0x0800\).*ttl (\d+).*proto ICMP \(1\).* (\d+\.\d+\.\d+\.\d+) > (\d+\.\d+\.\d+\.\d+): ICMP (echo request|echo reply), /;
    for (const [lines, packet] of [
      [ECHO_REQUEST_LINES, echoRequestPacket()],
      [ECHO_REPLY_LINES, echoReplyPacket()],
    ] as const) {
      const m = pattern.exec(joinLines([...lines]));
      expect(m).not.toBeNull();
      expect(m![1]).toBe(value(packet, "eth-src"));
      expect(m![2]).toBe(value(packet, "eth-dst"));
      expect(m![3]).toBe(value(packet, "ip-ttl"));
      expect(m![4]).toBe(value(packet, "ip-src"));
      expect(m![5]).toBe(value(packet, "ip-dst"));
      expect(m![6]).toBe(value(packet, "icmp-type"));
    }
    // The request and the reply are the same ping with source and destination swapped.
    const diff = compare(echoRequestPacket(), echoReplyPacket());
    expect(diff.changed.sort()).toEqual(["eth-dst", "eth-src", "icmp-type", "ip-dst", "ip-src"]);
    expect(value(echoReplyPacket(), "eth-dst")).toBe(value(echoRequestPacket(), "eth-src"));
    expect(value(echoReplyPacket(), "ip-dst")).toBe(value(echoRequestPacket(), "ip-src"));
  });

  it("agrees with the ARP request line", () => {
    const m = /^\S+ (\S+) > (\S+), ethertype ARP \(0x0806\).* Request who-has (\S+) tell (\S+), length 28$/.exec(ARP_REQUEST_LINE);
    expect(m).not.toBeNull();
    const p = arpRequestPacket();
    expect(m![1]).toBe(value(p, "eth-src"));
    expect(m![2]).toBe(value(p, "eth-dst"));
    expect(m![3]).toBe(value(p, "arp-target"));
    expect(m![4]).toBe(value(p, "arp-sender"));
    expect(value(p, "eth-type")).toBe("ARP (0x0806)");
    expect(value(p, "arp-op")).toBe("request");
  });

  it("keeps the three capture lines word for word, and every lit word shows its field's value", () => {
    expect(lineText(ARP_REQUEST_SEGMENTS)).toBe(stripTime(ARP_REQUEST_LINE));
    expect(lineText(ECHO_REQUEST_SEGMENTS)).toBe(stripTime(joinLines(ECHO_REQUEST_LINES)));
    expect(lineText(ECHO_REPLY_SEGMENTS)).toBe(stripTime(joinLines(ECHO_REPLY_LINES)));
    for (const line of netM1PacketOwnLinesConfig.mode === "lines" ? netM1PacketOwnLinesConfig.lines : []) {
      const lit = litFields(line.segments);
      expect(lit.length, line.id).toBeGreaterThanOrEqual(6);
      for (const id of lit) {
        const field = findField(line.packet, id);
        expect(field, `${line.id} ${id}`).toBeDefined();
        const words = line.segments.filter((s) => s.field === id).map((s) => s.text.toLowerCase());
        expect(words.some((w) => w.includes(field!.value.toLowerCase())), `${line.id} ${id} ${field!.value}`).toBe(true);
      }
      // Every field of the bands (but the empty port slot) is lit by some word.
      for (const f of allFields(line.packet).filter((f) => f.id !== "payload" && !f.absent)) expect(lit, `${line.id} ${f.id}`).toContain(f.id);
    }
  });

  it("decodes the same hex for the other fields of the 'change' picture", () => {
    if (netM1PacketChangeConfig.mode !== "change") throw new Error("the change slug must use the change mode");
    const [recorded, other] = netM1PacketChangeConfig.options;
    expect(recorded.packet).toEqual(echoRequestPacket());
    expect(value(recorded.packet, "ip-dst")).toBe(decode(ECHO_HEX).dstIp);
    expect(value(other.packet, "ip-dst")).toBe("192.168.1.30");
    expect(value(other.packet, "eth-dst")).toBe("02:00:00:00:00:30");
  });
});

// ---------------------------------------------------------------- fictional values

describe("fictional packets", () => {
  it("use only locally administered MACs (first byte 02) and documentation-range public addresses", () => {
    const fictional: Packet[] = [webRequestPacket(), echoRequestToOtherPacket()];
    for (const m of [WEB_LAPTOP_MAC, WEB_ROUTER_IN_MAC, WEB_ROUTER_OUT_MAC, WEB_NEXT_HOP_MAC]) {
      expect(isMac(m)).toBe(true);
      expect(m.startsWith("02:")).toBe(true);
      expect(isLocallyAdministered(m)).toBe(true);
    }
    const web = fictional[0];
    for (const id of ["eth-dst", "eth-src"]) expect(value(web, id)!.startsWith("02:"), id).toBe(true);
    expect(value(echoRequestToOtherPacket(), "eth-dst")).toBe("02:00:00:00:00:30");
    expect(value(web, "ip-dst")).toMatch(/^203\.0\.113\.\d+$/);
    expect(value(web, "ip-src")).toMatch(/^192\.168\./);
    expect(value(web, "tcp-dport")).toBe("80");
  });

  it("starts the router hop at TTL 64 and ends at 63", () => {
    expect(value(webRequestPacket(), "ip-ttl")).toBe("64");
    const hop = routerHop(webRequestPacket(), { srcMac: WEB_ROUTER_OUT_MAC, dstMac: WEB_NEXT_HOP_MAC });
    expect(hop.ok && hop.ttlAfter).toBe(63);
  });
});

// ---------------------------------------------------------------- the model

describe("reading a packet", () => {
  it("lists every field outermost first with the message last", () => {
    const ids = allFields(dnsQueryPacket()).map((f) => f.id);
    expect(ids).toEqual(["eth-dst", "eth-src", "eth-type", "ip-src", "ip-dst", "ip-ttl", "ip-proto", "udp-sport", "udp-dport", "payload"]);
    expect(layerOf(dnsQueryPacket(), "udp-dport")?.id).toBe("udp");
    expect(layerOf(dnsQueryPacket(), "payload")).toBeUndefined();
    expect(findField(dnsQueryPacket(), "nope")).toBeUndefined();
  });

  it("names a field the way a screen reader should hear it", () => {
    const ttl = findField(echoRequestPacket(), "ip-ttl")!;
    expect(fieldName(ttl)).toBe("TTL, 64, set by your laptop's operating system (64 by default on Linux)");
    const port = findField(echoRequestPacket(), "icmp-port")!;
    expect(port.absent).toBe(true);
    expect(fieldName(port)).toContain("ICMP has no ports");
  });

  it("summarises a packet in words, with every layer", () => {
    const text = packetSummary(echoRequestPacket());
    expect(text).toContain("Ethernet header: destination MAC da:dc:29:fd:5e:bf");
    expect(text).toContain("IP header: source address 192.168.1.10");
    expect(text).toContain("no port");
    expect(text).toContain("message: data 56 bytes");
  });

  it("titles a band with the header and its job", () => {
    expect(bandTitle(echoRequestPacket().layers[0])).toBe("Ethernet: this link");
    expect(bandTitle(echoRequestPacket().layers[1])).toBe("IP: the whole path");
    expect(bandTitle(arpRequestPacket().layers[1])).toBe("ARP: asking for a MAC");
  });
});

describe("what the fields say", () => {
  const packets = [dnsQueryPacket(), echoRequestPacket(), echoReplyPacket(), arpRequestPacket(), echoRequestToOtherPacket(), webRequestPacket()];

  it("gives every field a what, a who and a module, in the words of the course", () => {
    for (const p of packets) {
      for (const f of allFields(p)) {
        expect(f.what.length, f.id).toBeGreaterThan(10);
        expect(f.who.length, f.id).toBeGreaterThan(5);
        expect(f.label.length, f.id).toBeGreaterThan(1);
        // The message belongs to no header: a ping's filler has no module, a DNS question is module 7.
        if (f.id === "payload") expect([null, 7], f.id).toContain(f.module);
        else expect(f.module, f.id).toBeGreaterThanOrEqual(1);
        expect(`${f.what} ${f.who} ${f.label} ${f.value}`, f.id).not.toMatch(EM_DASH);
      }
    }
  });

  it("points ports at module 5, MACs and ARP at module 3, IP addresses at module 2, TTL at module 4, DNS at module 7", () => {
    const dns = dnsQueryPacket();
    expect(findField(dns, "udp-sport")!.module).toBe(5);
    expect(findField(dns, "udp-dport")!.module).toBe(5);
    expect(findField(dns, "eth-dst")!.module).toBe(3);
    expect(findField(dns, "eth-src")!.module).toBe(3);
    expect(findField(dns, "ip-src")!.module).toBe(2);
    expect(findField(dns, "ip-dst")!.module).toBe(2);
    expect(findField(dns, "ip-ttl")!.module).toBe(4);
    expect(findField(dns, "payload")!.module).toBe(7);
    for (const f of arpRequestPacket().layers[1].fields) expect(f.module).toBe(3);
  });

  it("says the TTL is set by the sending computer's operating system, 64 by default on Linux", () => {
    for (const p of [dnsQueryPacket(), echoRequestPacket(), webRequestPacket()]) {
      expect(findField(p, "ip-ttl")!.who).toBe("your laptop's operating system (64 by default on Linux)");
    }
  });

  it("names no AI model or vendor", () => {
    for (const p of packets) for (const f of allFields(p)) expect(`${f.what} ${f.who}`, f.id).not.toMatch(/claude|anthropic|openai|gpt|gemini|llama|copilot/i);
  });

  it("describes each kind of header", () => {
    for (const [id, info] of Object.entries(LAYER_INFO)) {
      expect(info.id).toBe(id);
      expect(info.job.length).toBeGreaterThan(10);
      expect(info.readBy.length).toBeGreaterThan(10);
      expect(`${info.name} ${info.short} ${info.job} ${info.address} ${info.readBy}`).not.toMatch(EM_DASH);
    }
    expect(LAYER_INFO.ethernet.module).toBe(3);
    expect(LAYER_INFO.ip.module).toBe(2);
    expect(LAYER_INFO.tcp.module).toBe(5);
  });
});

describe("wrapping", () => {
  const web = webRequestPacket();
  const layer = (id: string) => web.layers.find((l) => l.id === id)!;
  const bare: Packet = { layers: [], payload: web.payload };

  it("builds the packet from the inside out and ends with Ethernet outermost", () => {
    let p = bare;
    for (const id of WRAP_ORDER) {
      expect(nextToWrap(p)).toBe(id);
      const attempt = tryWrap(p, layer(id));
      expect(attempt.ok).toBe(true);
      if (attempt.ok) p = attempt.packet;
    }
    expect(p.layers.map((l) => l.id)).toEqual(["ethernet", "ip", "tcp"]);
    expect(p).toEqual(web);
    expect(nextToWrap(p)).toBeNull();
  });

  it("refuses a header out of order and says why", () => {
    const early = tryWrap(bare, layer("ethernet"));
    expect(early).toMatchObject({ ok: false });
    expect(!early.ok && early.reason).toMatch(/Ethernet goes on last/);
    const ipFirst = tryWrap(bare, layer("ip"));
    expect(!ipFirst.ok && ipFirst.reason).toMatch(/add TCP first/);
    const withTcp = wrap(bare, layer("tcp"));
    const ethBeforeIp = tryWrap(withTcp, layer("ethernet"));
    expect(!ethBeforeIp.ok && ethBeforeIp.reason).toMatch(/add IP first/);
    const again = tryWrap(withTcp, layer("tcp"));
    expect(!again.ok && again.reason).toMatch(/already on/);
    const done = tryWrap(web, layer("tcp"));
    expect(done.ok).toBe(false);
  });

  it("does not change the packet it was given", () => {
    const before = JSON.stringify(bare);
    tryWrap(bare, layer("tcp"));
    tryWrap(bare, layer("ethernet"));
    wrap(bare, layer("tcp"));
    expect(JSON.stringify(bare)).toBe(before);
  });

  it("has a note for each header and no em dash in any reason", () => {
    for (const id of WRAP_ORDER) expect(WRAP_NOTES[id]!.length).toBeGreaterThan(20);
    for (const attempt of [tryWrap(bare, layer("ethernet")), tryWrap(bare, layer("ip")), tryWrap(wrap(bare, layer("tcp")), layer("ethernet"))]) {
      expect(attempt.ok ? "" : attempt.reason).not.toMatch(EM_DASH);
    }
    for (const note of Object.values(WRAP_NOTES)) expect(note).not.toMatch(EM_DASH);
  });
});

describe("unwrapping", () => {
  it("takes off only the outer layer", () => {
    const web = webRequestPacket();
    const result = unwrap(web)!;
    expect(result.removed.id).toBe("ethernet");
    expect(result.packet.layers.map((l) => l.id)).toEqual(["ip", "tcp"]);
    expect(result.packet.payload).toEqual(web.payload);
    expect(wrap(result.packet, result.removed)).toEqual(web);
  });

  it("returns null when no layer is left, and never changes its input", () => {
    expect(unwrap({ layers: [], payload: webRequestPacket().payload })).toBeNull();
    const web = webRequestPacket();
    const before = JSON.stringify(web);
    unwrap(web);
    expect(JSON.stringify(web)).toBe(before);
  });
});

describe("a router hop", () => {
  const hop = { srcMac: WEB_ROUTER_OUT_MAC, dstMac: WEB_NEXT_HOP_MAC };

  it("strips Ethernet, lowers TTL by one and wraps a new Ethernet header", () => {
    const web = webRequestPacket();
    const before = JSON.stringify(web);
    const result = routerHop(web, hop);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(JSON.stringify(web)).toBe(before);
    expect(result.arrived).toEqual(web);
    expect(result.removed.id).toBe("ethernet");
    expect(result.stripped.layers.map((l) => l.id)).toEqual(["ip", "tcp"]);
    expect(result.out.layers.map((l) => l.id)).toEqual(["ethernet", "ip", "tcp"]);
    expect([result.ttlBefore, result.ttlAfter]).toEqual([64, 63]);
    expect(value(result.out, "ip-ttl")).toBe("63");
    expect(value(result.out, "eth-src")).toBe(WEB_ROUTER_OUT_MAC);
    expect(value(result.out, "eth-dst")).toBe(WEB_NEXT_HOP_MAC);
    expect(value(result.out, "eth-type")).toBe(value(web, "eth-type"));
  });

  it("changes the MACs and the TTL and nothing else", () => {
    const result = routerHop(webRequestPacket(), hop);
    if (!result.ok) throw new Error("hop failed");
    const diff = compare(result.arrived, result.out);
    expect(diff.changed.sort()).toEqual(["eth-dst", "eth-src", "ip-ttl"]);
    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual([]);
    for (const id of ["ip-src", "ip-dst", "ip-proto", "tcp-sport", "tcp-dport", "payload", "eth-type"]) expect(diff.same).toContain(id);
  });

  it("can run twice: 64 becomes 62 after two routers, as the lab showed", () => {
    const first = routerHop(webRequestPacket(), hop);
    if (!first.ok) throw new Error("first hop failed");
    const second = routerHop(first.out, { srcMac: "02:00:00:00:00:04", dstMac: "02:00:00:00:00:05" });
    expect(second.ok && value(second.out, "ip-ttl")).toBe("62");
  });

  it("drops a packet whose TTL would reach 0", () => {
    for (const ttl of ["1", "0"]) {
      const p = setField(webRequestPacket(), "ip-ttl", { value: ttl });
      const result = routerHop(p, hop);
      expect(result).toMatchObject({ ok: false, reason: "ttl-expired" });
    }
    const two = routerHop(setField(webRequestPacket(), "ip-ttl", { value: "2" }), hop);
    expect(two.ok && two.ttlAfter).toBe(1);
  });

  it("refuses a packet that is not Ethernet over IP, or has no usable TTL", () => {
    const web = webRequestPacket();
    expect(routerHop({ layers: [], payload: web.payload }, hop)).toMatchObject({ ok: false, reason: "no-ethernet" });
    expect(routerHop(unwrap(web)!.packet, hop)).toMatchObject({ ok: false, reason: "no-ethernet" });
    const noIp: Packet = { layers: [web.layers[0], web.layers[2]], payload: web.payload };
    expect(routerHop(noIp, hop)).toMatchObject({ ok: false, reason: "no-ip" });
    for (const bad of ["abc", "-3", "6.5", ""]) expect(routerHop(setField(web, "ip-ttl", { value: bad }), hop)).toMatchObject({ ok: false, reason: "bad-ttl" });
  });
});

describe("comparing packets", () => {
  it("finds that only the destination address and MAC change when the ping goes elsewhere", () => {
    const diff = compare(echoRequestPacket(), echoRequestToOtherPacket());
    expect(diff.changed.sort()).toEqual(["eth-dst", "ip-dst"]);
    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual([]);
    for (const id of ["eth-src", "eth-type", "ip-src", "ip-ttl", "ip-proto", "icmp-type", "icmp-port", "payload"]) expect(diff.same, id).toContain(id);
  });

  it("finds nothing changed in two equal packets, and reports added and removed fields", () => {
    expect(compare(dnsQueryPacket(), dnsQueryPacket())).toMatchObject({ changed: [], added: [], removed: [] });
    const diff = compare(dnsQueryPacket(), echoRequestPacket());
    expect(diff.removed).toEqual(expect.arrayContaining(["udp-sport", "udp-dport"]));
    expect(diff.added).toEqual(expect.arrayContaining(["icmp-type", "icmp-port"]));
    expect(diff.changed).toEqual(expect.arrayContaining(["ip-proto", "payload"]));
  });

  it("changes one field with setField and leaves the original alone", () => {
    const p = echoRequestPacket();
    const q = setField(p, "ip-ttl", { value: "10" });
    expect(value(q, "ip-ttl")).toBe("10");
    expect(value(p, "ip-ttl")).toBe("64");
    expect(compare(p, q).changed).toEqual(["ip-ttl"]);
    expect(setField(p, "nope", { value: "x" })).toEqual(p);
  });
});

// ---------------------------------------------------------------- the layout

const configs: [string, PacketConfig][] = [
  ["dns", netM1PacketDnsConfig],
  ["echo", netM1PacketEchoConfig],
  ["own-lines", netM1PacketOwnLinesConfig],
  ["change", netM1PacketChangeConfig],
  ["jobs", netM1PacketJobsConfig],
  ["wrap", netM1PacketWrapConfig],
  ["unwrap", netM1PacketUnwrapConfig],
];

/** Every packet any picture can draw. */
function allPackets(): [string, Packet, boolean][] {
  const out: [string, Packet, boolean][] = [];
  for (const [name, c] of configs) {
    if (c.mode === "lines") for (const l of c.lines) out.push([`${name} ${l.id}`, l.packet, true]);
    else if (c.mode === "change") for (const o of c.options) out.push([`${name} ${o.id}`, o.packet, false]);
    else out.push([name, c.packet, false]);
  }
  return out;
}

function checkLayout(name: string, layout: PacketLayout) {
  const chips = [...layout.bands.flatMap((b) => b.chips), ...(layout.payload ? [layout.payload] : [])];
  for (const c of chips) {
    expect(Number.isFinite(c.x + c.y + c.w + c.h), `${name} ${c.id} finite`).toBe(true);
    expect(c.x, `${name} ${c.id} left`).toBeGreaterThanOrEqual(MARGIN);
    expect(c.x + c.w, `${name} ${c.id} right`).toBeLessThanOrEqual(VIEW_W - MARGIN);
    // The chip's text fits the chip.
    if (c !== layout.payload) expect(c.w, `${name} ${c.id} text`).toBeGreaterThanOrEqual(chipWidth(c.label, c.value));
  }
  for (const band of layout.bands) {
    for (const c of band.chips) {
      expect(c.x, `${name} ${c.id} inside ${band.layer.id}`).toBeGreaterThanOrEqual(band.x + NEST);
      expect(c.x + c.w, `${name} ${c.id} inside ${band.layer.id}`).toBeLessThanOrEqual(band.x + band.w - NEST);
      expect(c.y, `${name} ${c.id} below title`).toBeGreaterThanOrEqual(band.y + 28);
      expect(c.y + c.h, `${name} ${c.id} above bottom`).toBeLessThanOrEqual(band.y + band.headerH);
    }
  }
  // No two chips of one band overlap, and no chip touches a chip of another band.
  for (let i = 0; i < chips.length; i++) {
    for (let j = i + 1; j < chips.length; j++) {
      const a = chips[i];
      const b = chips[j];
      const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
      expect(overlap, `${name} ${a.id} and ${b.id}`).toBe(false);
    }
  }
  // Each box sits inside the one around it, inset by NEST on both sides.
  layout.bands.forEach((band, i) => {
    const next = layout.bands[i + 1];
    if (next) {
      expect(next.x, `${name} ${band.layer.id} contains ${next.layer.id}`).toBe(band.x + NEST);
      expect(next.x + next.w).toBe(band.x + band.w - NEST);
      expect(next.y).toBe(band.y + band.headerH);
      expect(next.y + next.h).toBe(band.y + band.h - NEST);
    } else if (layout.payload) {
      expect(layout.payload.x).toBe(band.x + NEST);
      expect(layout.payload.w).toBe(band.w - 2 * NEST);
      expect(layout.payload.y).toBe(band.y + band.headerH);
      expect(layout.payload.y + layout.payload.h).toBe(band.y + band.h - NEST);
    }
  });
  expect(layout.bottom - layout.top).toBe(layout.height);
}

describe("packet layout", () => {
  it("fits every chip inside its band and the picture, with no overlap, for every packet", () => {
    for (const [name, p, hidePayload] of allPackets()) {
      checkLayout(name, layoutPacket(p, { top: 50, hidePayload }));
      checkLayout(`${name} with notes`, layoutPacket(p, { top: 50, hidePayload, noteChars: { "eth-dst": 7, "eth-src": 3, "ip-dst": 7, "ip-ttl": 6 } }));
    }
  });

  it("uses at most two rows of chips per band and the whole picture stays under 480 units tall", () => {
    for (const [name, p, hidePayload] of allPackets()) {
      const layout = layoutPacket(p, { top: 50, hidePayload });
      for (const band of layout.bands) {
        const rows = new Set(band.chips.map((c) => c.y)).size;
        expect(rows, `${name} ${band.layer.id}`).toBeLessThanOrEqual(2);
      }
      expect(layout.bottom, name).toBeLessThan(480);
    }
  });

  it("reserves room for a note without moving a chip", () => {
    const plain = layoutPacket(echoRequestPacket(), { top: 50 });
    const ids = Object.fromEntries(["eth-dst", "ip-dst"].map((id) => [id, 7]));
    const noted = layoutPacket(echoRequestToOtherPacket(), { top: 50, noteChars: ids });
    const same = layoutPacket(echoRequestPacket(), { top: 50, noteChars: ids });
    // The two options share one geometry, so the picture does not jump when the learner picks the other.
    expect(noted.bands.map((b) => b.chips.map((c) => [c.id, c.x, c.y, c.w]))).toEqual(same.bands.map((b) => b.chips.map((c) => [c.id, c.x, c.y, c.w])));
    expect(chipWidth("destination address", "192.168.1.20", 7)).toBeGreaterThan(chipWidth("destination address", "192.168.1.20"));
    expect(plain.height).toBeGreaterThan(0);
  });

  it("keeps the message and the inner boxes still while a packet grows outward", () => {
    const full = webRequestPacket();
    const done = layoutPacket(full, { top: 50 });
    const payloadBottom = done.payload!.y + done.payload!.h;
    const states: Packet[] = [{ layers: [], payload: full.payload }, { layers: full.layers.slice(2), payload: full.payload }, { layers: full.layers.slice(1), payload: full.payload }, full];
    const layouts = states.map((p) => layoutPacket(p, { baseDepth: 3 - p.layers.length, payloadBottom }));
    for (const l of layouts) {
      expect(l.payload!.y).toBeCloseTo(done.payload!.y);
      expect(l.payload!.x).toBe(done.payload!.x);
      expect(l.payload!.w).toBe(done.payload!.w);
      checkLayout("grow", l);
    }
    // Each header keeps its place once it is on.
    for (const id of ["tcp", "ip", "ethernet"]) {
      const ref = done.bands.find((b) => b.layer.id === id)!;
      for (const l of layouts) {
        const b = l.bands.find((x) => x.layer.id === id);
        if (!b) continue;
        expect([b.x, b.y, b.w, b.h]).toEqual([ref.x, ref.y, ref.w, ref.h]);
      }
    }
    expect(layouts[3].top).toBeCloseTo(done.top);
  });

  it("puts the packet without its Ethernet header exactly where it sat inside it", () => {
    const hop = routerHop(webRequestPacket(), { srcMac: WEB_ROUTER_OUT_MAC, dstMac: WEB_NEXT_HOP_MAC });
    if (!hop.ok) throw new Error("hop failed");
    const noteChars = { "eth-dst": 3, "eth-src": 3, "ip-ttl": 6 };
    const arrived = layoutPacket(hop.arrived, { top: 50, noteChars });
    const payloadBottom = arrived.payload!.y + arrived.payload!.h;
    const stripped = layoutPacket(hop.stripped, { baseDepth: 1, payloadBottom, noteChars });
    const out = layoutPacket(hop.out, { top: 50, noteChars });
    checkLayout("arrived", arrived);
    checkLayout("stripped", stripped);
    checkLayout("out", out);
    expect(stripped.bands.map((b) => [b.layer.id, b.x, b.y, b.w, b.h])).toEqual(arrived.bands.slice(1).map((b) => [b.layer.id, b.x, b.y, b.w, b.h]));
    expect(out.height).toBe(arrived.height);
    expect(out.bands.map((b) => [b.x, b.y, b.w, b.h])).toEqual(arrived.bands.map((b) => [b.x, b.y, b.w, b.h]));
  });

  it("puts a message with no band at the top, and hides it on request", () => {
    const bare: Packet = { layers: [], payload: webRequestPacket().payload };
    const l = layoutPacket(bare, { top: 50 });
    expect(l.bands).toEqual([]);
    expect(l.payload).toMatchObject({ y: 50, h: CHIP_H });
    expect(layoutPacket(webRequestPacket(), { top: 50, hidePayload: true }).payload).toBeNull();
  });
});

describe("capture words", () => {
  it("flows every line into rows inside the panel, with no two words overlapping", () => {
    const x0 = MARGIN + 10;
    const width = OUTER_W - 20;
    for (const seg of [ARP_REQUEST_SEGMENTS, ECHO_REQUEST_SEGMENTS, ECHO_REPLY_SEGMENTS]) {
      const { words, rows } = flowWords(seg, x0, width);
      expect(words).toHaveLength(seg.length);
      expect(rows).toBeLessThanOrEqual(6);
      for (const w of words) {
        expect(w.x).toBeGreaterThanOrEqual(x0);
        expect(w.x + w.w).toBeLessThanOrEqual(x0 + width);
        // Eight units per character is a safe width for 13-unit monospace text.
        expect(w.w).toBeGreaterThanOrEqual(w.text.length * WORD_CHAR_W);
      }
      for (let i = 0; i < words.length; i++) {
        for (let j = i + 1; j < words.length; j++) {
          const a = words[i];
          const b = words[j];
          expect(a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h, `${a.text} and ${b.text}`).toBe(false);
        }
      }
    }
  });
});

// ---------------------------------------------------------------- the slugs

const SLUGS = {
  "net-m1-packet-dns": netM1PacketDns,
  "net-m1-packet-echo": netM1PacketEcho,
  "net-m1-packet-own-lines": netM1PacketOwnLines,
  "net-m1-packet-change": netM1PacketChange,
  "net-m1-packet-jobs": netM1PacketJobs,
  "net-m1-packet-wrap": netM1PacketWrap,
  "net-m1-packet-unwrap": netM1PacketUnwrap,
} as const;

describe("the packet slugs", () => {
  it("are registered, alongside the scene", () => {
    for (const [slug, spec] of Object.entries(SLUGS)) expect(canvasRegistry[slug as keyof typeof canvasRegistry], slug).toBe(spec);
    expect(canvasRegistry["net-m1-scene-broadcast-mac" as keyof typeof canvasRegistry]).toBe(netM1SceneBroadcastMac);
  });

  it("write no em dash and no AI vendor in the words learners read, and state their limits", () => {
    for (const spec of [...Object.values(SLUGS), netM1SceneBroadcastMac]) {
      const text = `${spec.title} ${spec.purpose} ${spec.limits}`;
      expect(text).not.toMatch(EM_DASH);
      expect(text).not.toMatch(/claude|anthropic|openai|gpt|gemini/i);
      expect(spec.limits.length).toBeGreaterThan(40);
    }
  });

  it("keep every verdict short enough for its banner (about 42 characters)", () => {
    expect(netM1PacketDnsConfig.mode === "inspect" && netM1PacketDnsConfig.verdict).toBe("Two addresses, two ports, one TTL");
    expect(netM1PacketEchoConfig.mode === "inspect" && netM1PacketEchoConfig.verdict).toBe("Two addresses, a TTL, a type: no port");
    const verdicts = [
      "Two addresses, two ports, one TTL",
      "Two addresses, a TTL, a type: no port",
      "ARP request: 6 words are fields",
      "Echo request: 8 words are fields",
      "Echo reply: 8 words are fields",
      "The ping as recorded, to 192.168.1.20",
      "2 changed, 6 stayed the same",
      "MAC address: this link",
      "IP address: the whole path",
      "Port: the app",
      "The message, with no headers yet",
      "TCP header on: the app's port",
      "IP header on: the far computer",
      "Packet complete: ready to send",
      "Not yet: that header goes on later",
      "Arrives with its Ethernet header",
      "Ethernet header off: only for that link",
      "Read the IP header: TTL 64",
      "TTL 63, new Ethernet header",
    ];
    // VerdictBanner widens with 8.3 units a character plus 46, up to the picture width less 16.
    for (const v of verdicts) {
      expect(v.length * 8.3 + 46, v).toBeLessThanOrEqual(VIEW_W - 16);
      expect(v).not.toMatch(EM_DASH);
    }
  });

  it("render the starting state on the server with a verdict, a field card or note, and a fold", () => {
    const expectations: [keyof typeof SLUGS, string[]][] = [
      ["net-m1-packet-dns", ["Two addresses, two ports, one TTL", "destination port, 53, set by", "Where the course explains it:", "module 5", "37028"]],
      ["net-m1-packet-echo", ["Two addresses, a TTL, a type: no port", "port, none. ICMP has no ports.", "How many more routers may pass the packet on", "module 4", "echo request"]],
      ["net-m1-packet-own-lines", ["ARP request: 6 words are fields", "Capture line 2, Echo request", "who-has 192.168.1.20", "Your laptop asks everyone on the link"]],
      ["net-m1-packet-change", ["The ping as recorded, to 192.168.1.20", "recorded in the lab", "made up, not recorded", "What it is:"]],
      ["net-m1-packet-jobs", ["MAC address: this link", "Ethernet header, this link", "Who reads it:", "02:00:00:00:00:23", "203.0.113.80"]],
      ["net-m1-packet-wrap", ["The message, with no headers yet", "Add the Ethernet header", "Add the TCP header", "Start over", "Which one goes on first?"]],
      ["net-m1-packet-unwrap", ["Arrives with its Ethernet header", "Strip", "Start over", "The packet reaches the router"]],
    ];
    for (const [slug, needles] of expectations) {
      const spec = SLUGS[slug];
      const html = renderToString(createElement(spec.component, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
      for (const needle of needles) expect(html, `${slug}: ${needle}`).toContain(needle);
      expect(html).toContain("<svg");
      expect(html).toContain("What this picture leaves out");
      expect(html).toContain('aria-live="polite"');
      expect(html).not.toMatch(/="NaN"|>NaN<|undefined/);
      expect(html).not.toMatch(EM_DASH);
      expect(html).not.toMatch(/dangerouslySetInnerHTML|<foreignObject|<script|#[0-9a-fA-F]{6}\b/);
      // Every picture but the router step-through has toggle buttons; the router steps are plain action buttons.
      if (slug !== "net-m1-packet-unwrap") expect(html).toContain("aria-pressed");
    }
  });

  it("render through the reader's entry point too", () => {
    for (const slug of [...Object.keys(SLUGS), "net-m1-scene-broadcast-mac"]) {
      const html = renderToString(createElement(InteractiveCanvas, { slug }));
      expect(html, slug).toContain("<svg");
      expect(html, slug).not.toMatch(/="NaN"|>NaN</);
    }
  });
});

// ---------------------------------------------------------------- the scene

describe("the broadcast scene", () => {
  const scene = netM1SceneBroadcastMac.scene;

  it("is a scene with four devices, all inside the picture", () => {
    expect(netM1SceneBroadcastMac.kind).toBe("scene");
    expect(scene.actors.map((a) => a.id)).toEqual(["laptop", "phone", "tv", "printer"]);
    expect(actorsInside(scene)).toBe(true);
    expect(scene.width).toBe(420);
    for (const a of scene.actors) expect((a.sub ?? "").length, a.id).toBeLessThanOrEqual(MAX_SUB_CHARS);
    for (const e of scene.events) if (e.kind === "say") expect(e.text.length, e.text).toBeLessThanOrEqual(MAX_SUB_CHARS);
  });

  it("sends one broadcast to all three others and one unicast reply from the phone", () => {
    const flights = scene.events.filter((e) => e.kind === "fly");
    const broadcast = flights.filter((e) => e.label.includes("ff:ff:ff:ff:ff:ff"));
    expect(broadcast.map((e) => e.to).sort()).toEqual(["phone", "printer", "tv"]);
    expect(broadcast.every((e) => e.from === "laptop")).toBe(true);
    const replies = flights.filter((e) => !e.label.includes("ff:ff:ff:ff:ff:ff"));
    expect(replies).toHaveLength(1);
    expect(replies[0]).toMatchObject({ from: "phone", to: "laptop" });
    expect(replies[0].label).toBe("to 02:00:00:00:00:10");
    // The reply starts after the broadcast has arrived.
    expect(replies[0].at).toBeGreaterThanOrEqual(Math.max(...broadcast.map((e) => e.at + e.dur)));
    // Nobody but the phone answers.
    expect(flights).toHaveLength(4);
  });

  it("ends on the verdict, and never draws two boxes over each other or a label over a card", () => {
    expect(sceneFrame(scene, loopTime(scene, 1e6)).verdict).toEqual({ text: "One broadcast, one answer.", tone: "good" });
    for (let t = 0; t <= scene.loop; t += 0.1) {
      const frame = sceneFrame(scene, t);
      expect(frameCollisions(scene, frame), `at ${t}s`).toEqual([]);
      // Every message in flight finds a clear place for its label at some moment of its trip.
      chipTops(scene, frame);
    }
    const mid = sceneFrame(scene, 0.99);
    expect(mid.packets).toHaveLength(3);
    expect(chipTops(scene, mid).every((top) => top !== null)).toBe(true);
    const reply = sceneFrame(scene, 3.69);
    expect(reply.packets).toHaveLength(1);
    expect(chipTops(scene, reply)[0]).not.toBeNull();
  });

  it("has the phone say it is the one and the others say they hear and do not reply", () => {
    const frame = sceneFrame(scene, 3.6);
    const sub = (id: string) => frame.actors.find((a) => a.id === id)?.sub;
    expect(sub("phone")).toBe("that is me");
    expect(sub("tv")).toBe("hears, no reply");
    expect(sub("printer")).toBe("hears, no reply");
  });

  it("uses only made-up MACs (first byte 02) besides the broadcast address", () => {
    const macs = scene.events.flatMap((e) => (e.kind === "fly" ? e.label.match(/[0-9a-f]{2}(:[0-9a-f]{2}){5}/g) ?? [] : []));
    for (const m of macs) expect(m === "ff:ff:ff:ff:ff:ff" || m.startsWith("02:"), m).toBe(true);
  });
});
