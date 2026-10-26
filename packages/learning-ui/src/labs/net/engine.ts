// The network lab engine: walks one packet at a time through a World, the way
// a Linux host, a learning switch and a Linux router would handle it. Every
// step is recorded as a NetEvent in plain English so the board can replay it.
// The rules come from the course's recorded lab runs (networking dossier 5.5
// to 5.8): an owner answers ARP only when it has a route back to the asker, a
// router answers from the address facing the sender, and anything dropped by
// a filter, a missing route back or a quiet router is lost silently.
//
// A router with nftables nat rules also tracks connections (nat.ts): it
// rewrites the destination before it routes (port forwarding, and the answer
// to a masqueraded flow), and the source after it routes (masquerade, and the
// answer to a forwarded port). Netfilter does it in the same order.

import type { ConntrackEntry, DeviceState, Endpoint, IfaceState, RouteState, Tuple, World } from "./model";
import {
  BROADCAST_MAC,
  ifaceOf,
  isLocalAddress,
  linkIndexOf,
  lookupRoute,
  peerOf,
  socketsOf,
  sourceFor,
} from "./model";
import { contains, formatIp } from "./ip";
import type { Proto } from "./nat";
import { claimPort, dnatRule, findEntry, masqueradeRule, opensFlow, protoOf, remember, reverse, tupleOf, withDst, withSrc } from "./nat";
import type { DnsStatus } from "./dnsmasq";
import { dnsAnswer, dnsServes } from "./dnsmasq";
import { filterVerdict, tracksFlows } from "./nft";

export type PacketKind =
  | "echo-request"
  | "echo-reply"
  | "time-exceeded"
  | "unreachable"
  | "udp"
  | "tcp-syn"
  | "tcp-syn-ack"
  | "tcp-rst";

export interface IpPacket {
  src: number;
  dst: number;
  ttl: number;
  kind: PacketKind;
  sport?: number;
  dport?: number;
  seq?: number;
  // The identifier of an ICMP echo, which stands in for a port when a router
  // tracks or translates it.
  id?: number;
  // For ICMP errors: "net" (no route), "port" (nothing listening on a UDP port).
  code?: "net" | "port";
  // For ICMP errors: the packet that caused it, so the sender can match it.
  about?: { src: number; dst: number; seq?: number; sport?: number; dport?: number; id?: number };
  // A DNS question (name) or its answer (status set) carried by a UDP packet.
  dns?: { name: string; status?: DnsStatus; answer?: number };
}

export interface ArpPayload {
  op: "request" | "reply";
  senderIp: number;
  senderMac: string;
  targetIp: number;
}

export interface Frame {
  srcMac: string;
  dstMac: string;
  arp?: ArpPayload;
  ip?: IpPacket;
}

export type NetEventKind =
  | "arp-request"
  | "arp-reply"
  | "arp-ignored"
  | "arp-failed"
  | "frame"
  | "switch-learn"
  | "switch-flood"
  | "switch-forward"
  | "forward"
  | "ttl-expired"
  | "filtered"
  | "no-route"
  | "no-route-back"
  | "not-forwarding"
  | "deliver"
  | "local-error";

export interface NetEvent {
  kind: NetEventKind;
  device: string;
  // The cable the frame crossed, by index into world.links.
  link?: number;
  frame?: Frame;
  text: string;
}

export interface Arrival {
  device: string;
  packet: IpPacket;
}

export interface Run {
  events: NetEvent[];
  arrivals: Arrival[];
  // Set when the sender's own kernel refused to send: no route at all.
  localError?: "unreachable";
  frames: number;
}

const MAX_FRAMES = 400;

const ip = formatIp;

export function newRun(): Run {
  return { events: [], arrivals: [], frames: 0 };
}


function describe(p: IpPacket): string {
  switch (p.kind) {
    case "echo-request":
      return "ping request";
    case "echo-reply":
      return "ping reply";
    case "time-exceeded":
      return "ICMP Time Exceeded";
    case "unreachable":
      return p.code === "port" ? "ICMP Port Unreachable" : "ICMP Destination Net Unreachable";
    case "udp":
      return `UDP packet to port ${p.dport}`;
    case "tcp-syn":
      return `TCP SYN to port ${p.dport}`;
    case "tcp-syn-ack":
      return "TCP SYN-ACK";
    case "tcp-rst":
      return "TCP RST";
  }
}

const isIcmpError = (p: IpPacket) => p.kind === "time-exceeded" || p.kind === "unreachable";

// Puts a frame on the cable at ep and returns every NIC that accepted it.
// Switches learn the sender's MAC on the ingress port, then forward to the
// learned port or flood to every other port.
function transmit(world: World, run: Run, from: Endpoint, frame: Frame, seenSwitches: Set<string> = new Set()): Endpoint[] {
  run.frames += 1;
  if (run.frames > MAX_FRAMES) return [];
  const peer = peerOf(world, from);
  if (!peer) return [];
  const link = linkIndexOf(world, from);
  const device = world.devices[peer.dev];
  if (!device) return [];
  const iface = ifaceOf(device, peer.iface);
  if (!iface?.up) return [];

  if (device.kind === "switch") {
    if (seenSwitches.has(device.id)) return [];
    seenSwitches.add(device.id);
    if (device.macTable[frame.srcMac] !== peer.iface) {
      device.macTable[frame.srcMac] = peer.iface;
      run.events.push({ kind: "switch-learn", device: device.id, link, frame, text: `${device.label} notes that ${frame.srcMac} is on port ${peer.iface}.` });
    }
    const known = frame.dstMac === BROADCAST_MAC ? undefined : device.macTable[frame.dstMac];
    const outPorts = known
      ? [known]
      : device.ifaces.filter((p) => p.name !== peer.iface && p.up && peerOf(world, { dev: device.id, iface: p.name })).map((p) => p.name);
    run.events.push(
      known
        ? { kind: "switch-forward", device: device.id, link, frame, text: `${device.label} knows ${frame.dstMac} is on port ${known} and sends it only there.` }
        : {
            kind: "switch-flood",
            device: device.id,
            link,
            frame,
            text:
              frame.dstMac === BROADCAST_MAC
                ? `${device.label} copies the broadcast to every other port.`
                : `${device.label} has not seen ${frame.dstMac} yet, so it copies the frame to every other port.`,
          },
    );
    const accepted: Endpoint[] = [];
    for (const port of outPorts) {
      if (port === peer.iface) continue;
      accepted.push(...transmit(world, run, { dev: device.id, iface: port }, frame, seenSwitches));
    }
    return accepted;
  }

  run.events.push({ kind: "frame", device: device.id, link, frame, text: frameText(device, frame) });
  if (frame.dstMac !== BROADCAST_MAC && frame.dstMac !== iface.mac) return [];
  return [peer];
}

function frameText(device: DeviceState, frame: Frame): string {
  if (frame.arp?.op === "request") return `${device.label} hears: who has ${ip(frame.arp.targetIp)}? Tell ${ip(frame.arp.senderIp)}.`;
  if (frame.arp?.op === "reply") return `${device.label} gets the answer: ${ip(frame.arp.senderIp)} is at ${frame.arp.senderMac}.`;
  if (frame.ip) return `${device.label} receives a ${describe(frame.ip)} from ${ip(frame.ip.src)} to ${ip(frame.ip.dst)} (TTL ${frame.ip.ttl}).`;
  return `${device.label} receives a frame.`;
}

function rememberNeighbour(device: DeviceState, dev: string, addr: number, mac: string | null, state: "REACHABLE" | "STALE" | "FAILED") {
  const existing = device.neigh.find((n) => n.ip === addr && n.dev === dev);
  if (existing) {
    existing.mac = mac;
    existing.state = state;
  } else {
    device.neigh.push({ ip: addr, dev, mac, state });
  }
}

// What a NIC does with an ARP frame it accepted.
function receiveArp(world: World, run: Run, at: Endpoint, arp: ArpPayload) {
  const device = world.devices[at.dev];
  const iface = ifaceOf(device, at.iface) as IfaceState;
  if (arp.op === "reply") {
    rememberNeighbour(device, iface.name, arp.senderIp, arp.senderMac, "REACHABLE");
    return;
  }
  if (!isLocalAddress(device, arp.targetIp) || arp.targetIp >>> 24 === 127) return;
  // Linux checks it can route back to the asker before it answers (loose
  // reverse path filter). With mismatched masks this is why one side hears
  // the question and stays quiet.
  if (!lookupRoute(device, arp.senderIp)) {
    run.events.push({ kind: "arp-ignored", device: device.id, text: `${device.label} owns ${ip(arp.targetIp)} but has no route back to ${ip(arp.senderIp)}, so it does not answer.` });
    return;
  }
  rememberNeighbour(device, iface.name, arp.senderIp, arp.senderMac, "STALE");
  const reply: Frame = { srcMac: iface.mac, dstMac: arp.senderMac, arp: { op: "reply", senderIp: arp.targetIp, senderMac: iface.mac, targetIp: arp.senderIp } };
  run.events.push({ kind: "arp-reply", device: device.id, link: linkIndexOf(world, at), frame: reply, text: `${device.label} answers: ${ip(arp.targetIp)} is at ${iface.mac}.` });
  for (const to of transmit(world, run, at, reply)) {
    receiveFrame(world, run, to, reply);
  }
}

function receiveFrame(world: World, run: Run, at: Endpoint, frame: Frame) {
  if (frame.arp) receiveArp(world, run, at, frame.arp);
  else if (frame.ip) receiveIp(world, run, at, frame.ip);
}

// The MAC for a next hop on one interface: from the neighbour table, or by
// asking with an ARP broadcast.
function resolve(world: World, run: Run, device: DeviceState, iface: IfaceState, hop: number): string | null {
  const known = device.neigh.find((n) => n.ip === hop && n.dev === iface.name && n.mac);
  if (known?.mac) return known.mac;
  const sender = iface.addrs.find((a) => contains(a, hop)) ?? iface.addrs[0];
  if (!sender) return null;
  const request: Frame = { srcMac: iface.mac, dstMac: BROADCAST_MAC, arp: { op: "request", senderIp: sender.addr, senderMac: iface.mac, targetIp: hop } };
  run.events.push({
    kind: "arp-request",
    device: device.id,
    link: linkIndexOf(world, { dev: device.id, iface: iface.name }),
    frame: request,
    text: `${device.label} needs the MAC for ${ip(hop)}, so it asks everyone on ${iface.name}: who has ${ip(hop)}?`,
  });
  for (const to of transmit(world, run, { dev: device.id, iface: iface.name }, request)) {
    receiveFrame(world, run, to, request);
  }
  const learned = device.neigh.find((n) => n.ip === hop && n.dev === iface.name && n.mac);
  if (learned?.mac) return learned.mac;
  rememberNeighbour(device, iface.name, hop, null, "FAILED");
  run.events.push({ kind: "arp-failed", device: device.id, text: `Nobody answers for ${ip(hop)}. ${device.label} cannot send, and the packet is lost without any error.` });
  return null;
}

// Sends a packet from a device: local delivery, or route, ARP and transmit.
// Returns false when the sender's own kernel refuses (no route at all).
export function sendIp(world: World, run: Run, deviceId: string, packet: IpPacket): boolean {
  const device = world.devices[deviceId];
  if (isLocalAddress(device, packet.dst)) {
    run.events.push({ kind: "deliver", device: device.id, text: `${device.label} sends it to itself over loopback.` });
    deliverLocal(world, run, device, packet);
    return true;
  }
  const route = lookupRoute(device, packet.dst);
  if (!route) {
    run.events.push({ kind: "local-error", device: device.id, text: `${device.label} has no route that matches ${ip(packet.dst)}, so its own kernel refuses: Network is unreachable.` });
    return false;
  }
  return emit(world, run, device, packet, route.dev, route.via ?? packet.dst);
}

function emit(world: World, run: Run, device: DeviceState, packet: IpPacket, dev: string, hop: number): boolean {
  const iface = ifaceOf(device, dev);
  if (!iface) return true;
  const mac = resolve(world, run, device, iface, hop);
  if (!mac) return true;
  const frame: Frame = { srcMac: iface.mac, dstMac: mac, ip: packet };
  run.events.push({
    kind: "forward",
    device: device.id,
    link: linkIndexOf(world, { dev: device.id, iface: dev }),
    frame,
    text: `${device.label} sends the ${describe(packet)} out of ${dev} to ${hop === packet.dst ? ip(hop) : `its next hop ${ip(hop)}`} (MAC ${mac}).`,
  });
  for (const to of transmit(world, run, { dev: device.id, iface: dev }, frame)) {
    receiveFrame(world, run, to, frame);
  }
  return true;
}

// Source address for a packet a device starts itself, as the kernel picks it.
export function sourceAddress(device: DeviceState, dst: number): number | null {
  if (isLocalAddress(device, dst)) return dst;
  const route = lookupRoute(device, dst);
  return route ? sourceFor(device, route) : null;
}

function verdict(device: DeviceState, hook: "forward" | "input", inIface: string, outIface: string | undefined, p: IpPacket): "accept" | "drop" {
  return filterVerdict(device, hook, { iif: inIface, oif: outIface, src: p.src, dst: p.dst, proto: protoOf(p), dport: p.dport });
}

// A router's warning back to the sender, from the address facing the sender.
function icmpError(world: World, run: Run, device: DeviceState, original: IpPacket, kind: "time-exceeded" | "unreachable", code?: "net" | "port") {
  if (isIcmpError(original)) return;
  if (device.silent) return;
  const back = lookupRoute(device, original.src);
  const src = back ? sourceFor(device, back) : null;
  if (!back || src === null) {
    run.events.push({ kind: "no-route-back", device: device.id, text: `${device.label} has no route back to ${ip(original.src)}, so its warning is lost.` });
    return;
  }
  const about = { src: original.src, dst: original.dst, seq: original.seq, sport: original.sport, dport: original.dport, id: original.id };
  sendIp(world, run, device.id, { src, dst: original.src, ttl: 64, kind, code, about, seq: original.seq });
}


// A packet's journey through a router's netfilter hooks, kept between
// prerouting and postrouting.
interface Flow {
  proto: Proto;
  // The tuple the packet should have once translation is done.
  target: Tuple;
  // A flow the router has seen before.
  entry?: ConntrackEntry;
  // A new flow, remembered only once the packet is on its way out.
  pending?: ConntrackEntry;
}

const addr = (value: number, port: number, proto: Proto) => (proto === "icmp" ? ip(value) : `${ip(value)}:${port}`);

// What state a reply moves a tracked flow to. The lab models a whole request
// as one exchange, so a TCP answer leaves the entry as curl would: TIME_WAIT.
function markReplied(entry: ConntrackEntry, packet: IpPacket) {
  if (entry.state !== "SYN_SENT" && entry.state !== "UNREPLIED") return;
  if (packet.kind === "tcp-syn-ack") {
    entry.state = "TIME_WAIT";
    entry.assured = true;
  } else if (packet.kind === "tcp-rst") {
    entry.state = "CLOSE";
  } else {
    entry.state = "REPLIED";
  }
}

// An ICMP error that comes back for a translated flow carries the packet the
// router sent, after translation. Put the client's own header back and send it
// on to the client, as conntrack does for related errors.
function untranslateError(run: Run, device: DeviceState, packet: IpPacket): IpPacket {
  const about = packet.about;
  if (!about || !isLocalAddress(device, packet.dst)) return packet;
  const proto: Proto = about.dport === undefined ? "icmp" : "udp";
  for (const entry of device.conntrack) {
    if (entry.proto !== proto) continue;
    const seen = reverse(entry.reply);
    if (seen.src !== about.src || seen.dst !== about.dst) continue;
    if (proto === "udp" && (seen.dport !== about.dport || (about.sport !== undefined && seen.sport !== about.sport))) continue;
    run.events.push({
      kind: "forward",
      device: device.id,
      text: `${device.label} recognises the ICMP error as belonging to a connection it translated, and sends it to ${ip(entry.orig.src)}.`,
    });
    const inner = { ...about, src: entry.orig.src, sport: proto === "udp" ? entry.orig.sport : undefined, id: proto === "icmp" ? entry.orig.sport : undefined };
    return { ...packet, dst: entry.orig.src, about: inner };
  }
  return packet;
}

function prerouting(run: Run, device: DeviceState, iif: string, packet: IpPacket): { packet: IpPacket; flow?: Flow } {
  if (isIcmpError(packet)) return { packet: untranslateError(run, device, packet) };
  const proto = protoOf(packet);
  if (!proto) return { packet };
  const t = tupleOf(packet);
  let found = findEntry(device, proto, t);
  // A new SYN on a connection that already closed starts a fresh entry.
  if (found?.dir === "orig" && packet.kind === "tcp-syn" && (found.entry.state === "TIME_WAIT" || found.entry.state === "CLOSE")) {
    const old = found.entry;
    device.conntrack = device.conntrack.filter((e) => e !== old);
    found = null;
  }
  if (found) {
    const { entry, dir } = found;
    const target = dir === "orig" ? reverse(entry.reply) : reverse(entry.orig);
    if (dir === "reply") markReplied(entry, packet);
    const out = withDst(packet, target);
    if (dir === "reply" && (out.dst !== packet.dst || out.dport !== packet.dport)) {
      run.events.push({
        kind: "forward",
        device: device.id,
        text: `${device.label} finds this answer in its conntrack table and puts the original address back: ${addr(packet.dst, t.dport, proto)} becomes ${addr(out.dst, target.dport, proto)}.`,
      });
    }
    return { packet: out, flow: { proto, target, entry } };
  }
  if (!opensFlow(packet)) return { packet };
  const rule = dnatRule(device, iif, proto, t);
  const reply: Tuple = rule?.to ? { src: rule.to.ip, dst: t.src, sport: rule.to.port ?? t.dport, dport: t.sport } : reverse(t);
  const pending: ConntrackEntry = { proto, orig: t, reply, state: proto === "tcp" ? "SYN_SENT" : "UNREPLIED", assured: false };
  const target = reverse(reply);
  if (rule?.to) {
    run.events.push({
      kind: "forward",
      device: device.id,
      text: `A port-forward rule on ${device.label} rewrites the destination from ${addr(t.dst, t.dport, proto)} to ${addr(target.dst, target.dport, proto)} (DNAT) and remembers the pair.`,
    });
  }
  return { packet: withDst(packet, target), flow: { proto, target, pending } };
}

// After routing: masquerade a new flow, then rewrite the source to match.
function postrouting(run: Run, device: DeviceState, route: RouteState, flow: Flow, packet: IpPacket): IpPacket {
  let target = flow.target;
  const p = flow.pending;
  if (p) {
    const rule = masqueradeRule(device, route.dev, flow.proto, tupleOf(packet));
    const src = rule ? sourceFor(device, route) : null;
    if (rule && src !== null) {
      const wanted = { ...p.reply, dst: src };
      const port = claimPort(device, flow.proto, wanted);
      p.reply = { ...wanted, dport: port };
      target = reverse(p.reply);
      const was = addr(p.orig.src, p.orig.sport, flow.proto);
      run.events.push({
        kind: "forward",
        device: device.id,
        text:
          `${device.label} masquerades the packet: the source ${was} becomes ${addr(src, port, flow.proto)}, the address of ${route.dev}, and the pair goes into its conntrack table so the answer can find its way back.` +
          (port !== p.orig.sport ? ` Port ${p.orig.sport} was already taken for this destination, so it uses ${port}.` : ""),
      });
    }
    remember(device, p);
  }
  return withSrc(packet, target);
}

function receiveIp(world: World, run: Run, at: Endpoint, packet: IpPacket) {
  const device = world.devices[at.dev];
  let pkt = packet;
  let flow: Flow | undefined;
  if (tracksFlows(device)) {
    const pre = prerouting(run, device, at.iface, packet);
    pkt = pre.packet;
    flow = pre.flow;
  }
  if (isLocalAddress(device, pkt.dst)) {
    if (verdict(device, "input", at.iface, undefined, pkt) === "drop") {
      run.events.push({ kind: "filtered", device: device.id, text: `A filter rule on ${device.label} drops the packet from ${ip(pkt.src)} to ${ip(pkt.dst)}. No error goes back.` });
      return;
    }
    if (flow?.pending) {
      // The router is the destination, so the flow is confirmed here. Say how
      // it ends: a listener answers, nothing listening means a reset or an error.
      const answered = answers(device, pkt);
      const p = flow.pending;
      if (flow.proto === "tcp") {
        p.state = answered ? "TIME_WAIT" : "CLOSE";
        p.assured = answered;
      } else if (answered) p.state = "REPLIED";
      remember(device, p);
    }
    deliverLocal(world, run, device, pkt);
    return;
  }
  if (!device.forwarding) {
    run.events.push({ kind: "not-forwarding", device: device.id, text: `${device.label} is not ${ip(pkt.dst)} and does not forward packets, so it drops it.` });
    return;
  }
  const route = lookupRoute(device, pkt.dst);
  if (!route) {
    run.events.push({ kind: "no-route", device: device.id, text: `${device.label} has no route to ${ip(pkt.dst)}.${device.silent ? " It drops the packet quietly." : " It drops the packet and tells the sender."}` });
    icmpError(world, run, device, pkt, "unreachable", "net");
    return;
  }
  if (verdict(device, "forward", at.iface, route.dev, pkt) === "drop") {
    run.events.push({ kind: "filtered", device: device.id, text: `A filter rule on ${device.label} drops the packet from ${ip(pkt.src)} to ${ip(pkt.dst)}. No error goes back.` });
    return;
  }
  const ttl = pkt.ttl - 1;
  if (ttl <= 0) {
    run.events.push({
      kind: "ttl-expired",
      device: device.id,
      text: `The TTL reaches 0 at ${device.label}, so it discards the packet${device.silent ? " and stays quiet." : " and sends ICMP Time Exceeded back."}`,
    });
    icmpError(world, run, device, pkt, "time-exceeded");
    return;
  }
  let out: IpPacket = { ...pkt, ttl };
  if (flow) out = postrouting(run, device, route, flow, out);
  emit(world, run, device, out, route.dev, route.via ?? out.dst);
}

function listener(device: DeviceState, proto: "tcp" | "udp", dst: number, port: number) {
  return socketsOf(device).find((s) => s.proto === proto && s.port === port && (s.addr === 0 || s.addr === dst));
}

// Will the device answer this packet itself (rather than reset or refuse it)?
function answers(device: DeviceState, packet: IpPacket): boolean {
  switch (packet.kind) {
    case "echo-request":
      return true;
    case "tcp-syn":
      return !!listener(device, "tcp", packet.dst, packet.dport ?? 0);
    case "udp":
      return (packet.dport === 53 && !!packet.dns && dnsServes(device, packet.dst)) || !!listener(device, "udp", packet.dst, packet.dport ?? 0);
    default:
      return false;
  }
}

function deliverLocal(world: World, run: Run, device: DeviceState, packet: IpPacket) {
  run.arrivals.push({ device: device.id, packet });
  run.events.push({ kind: "deliver", device: device.id, text: `${device.label} is ${ip(packet.dst)}: the ${describe(packet)} has arrived.` });
  const reply = (kind: PacketKind, extra: Partial<IpPacket> = {}) =>
    sendIp(world, run, device.id, { src: packet.dst, dst: packet.src, ttl: 64, kind, seq: packet.seq, id: packet.id, sport: packet.dport, dport: packet.sport, ...extra });
  switch (packet.kind) {
    case "echo-request":
      reply("echo-reply");
      return;
    case "udp":
      // An answer to a DNS question is consumed by the asker, not refused.
      if (packet.dns?.status) return;
      if (packet.dport === 53 && packet.dns && dnsServes(device, packet.dst)) {
        const found = dnsAnswer(device, packet.dns.name);
        reply("udp", { dns: { name: packet.dns.name, status: found.status, answer: found.answer } });
        return;
      }
      if (!listener(device, "udp", packet.dst, packet.dport ?? 0)) {
        reply("unreachable", { code: "port", about: { src: packet.src, dst: packet.dst, seq: packet.seq, sport: packet.sport, dport: packet.dport } });
      }
      return;
    case "tcp-syn":
      reply(listener(device, "tcp", packet.dst, packet.dport ?? 0) ? "tcp-syn-ack" : "tcp-rst");
      return;
    default:
      return;
  }
}
