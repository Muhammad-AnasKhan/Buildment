// Connection tracking and address translation, the way Linux does them for a
// router with nftables nat rules. A tracked connection holds two tuples: the
// original (what the client sent) and the reply (what the answer will look
// like, after any rewrite). A packet that matches the original tuple is
// translated to the reverse of the reply tuple; a packet that matches the reply
// tuple is translated to the reverse of the original. That one rule covers
// masquerade, port forwarding and their answers.

import type { IpPacket } from "./engine";
import type { ConntrackEntry, DeviceState, NftRule, Tuple } from "./model";
import { formatIp } from "./ip";
import { chainsAt, ruleMatches } from "./nft";

export type Proto = "tcp" | "udp" | "icmp";

export function protoOf(p: IpPacket): Proto | null {
  switch (p.kind) {
    case "echo-request":
    case "echo-reply":
      return "icmp";
    case "udp":
      return "udp";
    case "tcp-syn":
    case "tcp-syn-ack":
    case "tcp-rst":
      return "tcp";
    default:
      return null;
  }
}

// Packets that open a connection; anything else without an entry is stray.
export const opensFlow = (p: IpPacket) => p.kind === "tcp-syn" || p.kind === "udp" || p.kind === "echo-request";

export function tupleOf(p: IpPacket): Tuple {
  if (protoOf(p) === "icmp") return { src: p.src, dst: p.dst, sport: p.id ?? 0, dport: p.id ?? 0 };
  return { src: p.src, dst: p.dst, sport: p.sport ?? 0, dport: p.dport ?? 0 };
}

export const reverse = (t: Tuple): Tuple => ({ src: t.dst, dst: t.src, sport: t.dport, dport: t.sport });

export const sameTuple = (a: Tuple, b: Tuple) => a.src === b.src && a.dst === b.dst && a.sport === b.sport && a.dport === b.dport;

export function findEntry(device: DeviceState, proto: Proto, t: Tuple): { entry: ConntrackEntry; dir: "orig" | "reply" } | null {
  for (const entry of device.conntrack) {
    if (entry.proto !== proto) continue;
    if (sameTuple(entry.orig, t)) return { entry, dir: "orig" };
    if (sameTuple(entry.reply, t)) return { entry, dir: "reply" };
  }
  return null;
}

// Rewrites the destination half of a packet (done before routing) or the
// source half (done after routing) to match a tuple.
export function withDst(p: IpPacket, t: Tuple): IpPacket {
  if (protoOf(p) === "icmp") return { ...p, dst: t.dst };
  return { ...p, dst: t.dst, dport: t.dport };
}

export function withSrc(p: IpPacket, t: Tuple): IpPacket {
  if (protoOf(p) === "icmp") return { ...p, src: t.src, id: t.sport };
  return { ...p, src: t.src, sport: t.sport };
}

export function dnatRule(device: DeviceState, iif: string, proto: Proto, t: Tuple): NftRule | null {
  for (const { chain } of chainsAt(device, "prerouting", "nat")) {
    for (const rule of chain.rules) {
      if (rule.action === "dnat" && ruleMatches(rule, { iif, src: t.src, dst: t.dst, proto, dport: t.dport })) return rule;
    }
  }
  return null;
}

export function masqueradeRule(device: DeviceState, oif: string, proto: Proto, t: Tuple): NftRule | null {
  for (const { chain } of chainsAt(device, "postrouting", "nat")) {
    for (const rule of chain.rules) {
      if (rule.action === "masquerade" && ruleMatches(rule, { oif, src: t.src, dst: t.dst, proto, dport: t.dport })) return rule;
    }
  }
  return null;
}

// Picks the source port a masqueraded flow leaves with. The kernel keeps the
// port when the translated tuple is free and picks another one when it is not
// (two clients that used the same port towards the same server).
export function claimPort(device: DeviceState, proto: Proto, reply: Tuple): number {
  const taken = (port: number) =>
    device.conntrack.some((e) => e.proto === proto && (sameTuple(e.reply, { ...reply, dport: port }) || sameTuple(e.orig, reverse({ ...reply, dport: port }))));
  let port = reply.dport;
  if (!taken(port)) return port;
  port = 1024 + ((reply.dport * 7919 + 1013) % 60000);
  while (taken(port)) port = port >= 65535 ? 1024 : port + 1;
  return port;
}

const MAX_ENTRIES = 64;

export function remember(device: DeviceState, entry: ConntrackEntry) {
  device.conntrack.push(entry);
  if (device.conntrack.length > MAX_ENTRIES) device.conntrack.shift();
}

// ---- conntrack -L --------------------------------------------------------

const TIMEOUT: Record<ConntrackEntry["state"], number> = { SYN_SENT: 119, TIME_WAIT: 119, CLOSE: 9, UNREPLIED: 29, REPLIED: 29 };

function side(proto: Proto, t: Tuple): string {
  if (proto === "icmp") return `src=${formatIp(t.src)} dst=${formatIp(t.dst)} type=PLACE code=0 id=${t.sport}`;
  return `src=${formatIp(t.src)} dst=${formatIp(t.dst)} sport=${t.sport} dport=${t.dport}`;
}

// One line in conntrack's format. The recorded runs show tcp lines such as
// "tcp      6 114 TIME_WAIT src=... [ASSURED] mark=0 use=1"; icmp and udp lines
// follow conntrack-tools' documented layout and are not in the recordings.
export function conntrackLine(e: ConntrackEntry): string {
  const head = e.proto === "tcp" ? "tcp      6" : e.proto === "udp" ? "udp      17" : "icmp     1";
  const state = e.proto === "tcp" ? ` ${e.state}` : "";
  const flag = e.assured ? " [ASSURED]" : e.state === "UNREPLIED" || e.state === "SYN_SENT" ? " [UNREPLIED]" : "";
  const first = side(e.proto, e.orig).replace("PLACE", "8");
  const second = side(e.proto, e.reply).replace("PLACE", "0");
  const unreplied = e.assured ? "" : flag;
  return `${head} ${TIMEOUT[e.state]}${state} ${first}${unreplied} ${second}${e.assured ? flag : ""} mark=0 use=1`;
}
