// The client side of DNS: ask a server about a name by sending a real UDP
// packet through the network, so routing, ARP, filters and a closed port all
// decide the answer. dig, curl and ping use this; so do the name checks.

import type { Run } from "./engine";
import { newRun, sendIp, sourceAddress } from "./engine";
import type { DeviceState, World } from "./model";
import { nextEphemeralPort } from "./model";
import type { DnsStatus } from "./dnsmasq";
import { normaliseName } from "./dnsmasq";
import { parseIp } from "./ip";

export type DnsOutcome =
  | { kind: "answer"; status: DnsStatus; answer?: number; run: Run }
  // The server's host answered with ICMP Port Unreachable: nothing listens.
  | { kind: "refused"; run: Run }
  | { kind: "unreachable"; run: Run }
  // Nothing came back: lost on the way, blocked, or nobody owns the address.
  | { kind: "timeout"; run: Run };

export function dnsQuery(world: World, device: DeviceState, server: number, name: string): DnsOutcome {
  const run = newRun();
  const src = sourceAddress(device, server);
  if (src === null) return { kind: "unreachable", run };
  const sport = nextEphemeralPort(device);
  const sent = sendIp(world, run, device.id, { src, dst: server, ttl: 64, kind: "udp", seq: 1, sport, dport: 53, dns: { name: normaliseName(name) } });
  if (!sent) return { kind: "unreachable", run };
  const mine = run.arrivals.filter((a) => a.device === device.id && a.packet.dst === src);
  const reply = mine.find((a) => a.packet.kind === "udp" && a.packet.dns?.status && a.packet.src === server);
  if (reply?.packet.dns?.status) return { kind: "answer", status: reply.packet.dns.status, answer: reply.packet.dns.answer, run };
  const error = mine.find((a) => a.packet.kind === "unreachable" && a.packet.about?.dport === 53);
  if (error) return { kind: error.packet.code === "port" ? "refused" : "unreachable", run };
  return { kind: "timeout", run };
}

// The nameservers a program on this device asks, in order. With no resolver
// file the C library falls back to the machine itself.
export function nameServersOf(device: DeviceState): number[] {
  return device.resolver && device.resolver.length > 0 ? device.resolver : [parseIp("127.0.0.1") as number];
}

export type Resolution = { ok: true; ip: number } | { ok: false; why: "nxdomain" | "refused" | "timeout" };

// Turns a name into an address the way a program does: each nameserver in
// turn, stopping at the first that answers for certain.
export function resolveName(world: World, device: DeviceState, name: string): Resolution {
  const literal = parseIp(name);
  if (literal !== null) return { ok: true, ip: literal };
  let timedOut = false;
  for (const server of nameServersOf(device)) {
    const outcome = dnsQuery(world, device, server, name);
    if (outcome.kind === "answer") {
      if (outcome.status === "NOERROR" && outcome.answer !== undefined) return { ok: true, ip: outcome.answer };
      if (outcome.status === "NXDOMAIN") return { ok: false, why: "nxdomain" };
    } else if (outcome.kind === "timeout") {
      timedOut = true;
    }
  }
  return { ok: false, why: timedOut ? "timeout" : "refused" };
}
