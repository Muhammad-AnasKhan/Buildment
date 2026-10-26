// Reachability checks for a network lab: "A can ping B", "the guest cannot
// reach the office", "the laptop got its address from DHCP". Each check runs on
// a copy of the World so checking never changes the neighbour tables or the
// connection table the learner is looking at.

import { newRun, sendIp, sourceAddress } from "./engine";
import type { World } from "./model";
import { cloneWorld, hasCarrier, ifaceOf, nextEphemeralPort } from "./model";
import { resolveName } from "./resolve";
import { contains, formatIp, parseCidr } from "./ip";

export interface NetCheck {
  id: string;
  label: string;
  from: string;
  // ping and tcp: an address, or a name the device resolves with its own
  // resolver. dns: the name to look up. link and address: an interface of
  // the device.
  to: string;
  kind: "ping" | "tcp" | "dns" | "link" | "address";
  port?: number;
  // "refused" means a TCP reset came back at once, as opposed to silence.
  expect: "reach" | "blocked" | "refused";
  // tcp: the source address the server must see ("203.0.113.1" after masquerade).
  seenAs?: string;
  // tcp: the device that must receive the connection (a port forward lands
  // on an inside host, not on the address asked for).
  seenBy?: string;
  // address: the interface address must lie in this block, and may be
  // required to have come from a DHCP lease.
  within?: string;
  leased?: boolean;
}

export interface NetCheckResult {
  id: string;
  pass: boolean;
  reached: boolean;
}

interface Outcome {
  reached: boolean;
  refused: boolean;
  // false when the check wanted something specific and got something else.
  matched: boolean;
}

const none: Outcome = { reached: false, refused: false, matched: false };

function evaluate(world: World, check: NetCheck): Outcome {
  const copy = cloneWorld(world);
  const device = copy.devices[check.from];
  if (!device) return none;

  if (check.kind === "link") {
    const iface = ifaceOf(device, check.to);
    const up = !!iface && iface.up && hasCarrier(copy, device, iface);
    return { reached: up, refused: false, matched: up };
  }
  if (check.kind === "address") {
    const iface = ifaceOf(device, check.to);
    const block = check.within ? parseCidr(check.within) : null;
    const has = !!iface && iface.addrs.length > 0 && (!block || iface.addrs.some((a) => contains(block, a.addr)));
    const leased = !check.leased || !!iface?.lease;
    return { reached: has && leased, refused: false, matched: has && leased };
  }

  const named = resolveName(copy, device, check.to);
  if (check.kind === "dns") return { reached: named.ok, refused: false, matched: named.ok };
  if (!named.ok) return none;
  const dst = named.ip;
  const src = sourceAddress(device, dst);
  if (src === null) return none;
  const run = newRun();
  const tcp = check.kind === "tcp";
  sendIp(copy, run, check.from, {
    src,
    dst,
    ttl: 64,
    kind: tcp ? "tcp-syn" : "echo-request",
    seq: 1,
    sport: tcp ? nextEphemeralPort(device) : undefined,
    dport: check.port,
    id: tcp ? undefined : 1,
  });
  const want = tcp ? "tcp-syn-ack" : "echo-reply";
  const reached = run.arrivals.some((a) => a.device === check.from && a.packet.kind === want && a.packet.src === dst);
  const refused = run.arrivals.some((a) => a.device === check.from && a.packet.kind === "tcp-rst" && a.packet.src === dst);
  let matched = true;
  if (tcp && (check.seenAs || check.seenBy)) {
    const syn = run.arrivals.find((a) => a.packet.kind === "tcp-syn");
    if (check.seenBy && syn?.device !== check.seenBy) matched = false;
    if (check.seenAs && (!syn || formatIp(syn.packet.src) !== check.seenAs)) matched = false;
  }
  return { reached, refused, matched };
}

export function reaches(world: World, from: string, to: string, kind: "ping" | "tcp", port?: number): boolean {
  return evaluate(world, { id: "reaches", label: "", from, to, kind, port, expect: "reach" }).reached;
}

export function runChecks(world: World, checks: NetCheck[]): NetCheckResult[] {
  return checks.map((check) => {
    const out = evaluate(world, check);
    const pass = check.expect === "reach" ? out.reached && out.matched : check.expect === "refused" ? out.refused : !out.reached;
    return { id: check.id, reached: out.reached, pass };
  });
}

export function describeTarget(check: NetCheck): string {
  return check.kind === "tcp" ? `${check.to}:${check.port}` : check.to;
}

// A short phrase for the checklist: what the device is asked to do.
export function describeCheck(check: NetCheck): string {
  switch (check.kind) {
    case "tcp":
      return `${check.from} connects to ${describeTarget(check)}`;
    case "dns":
      return `${check.from} looks up ${check.to}`;
    case "link":
      return `${check.from} has a link on ${check.to}`;
    case "address":
      return `${check.from} has an address on ${check.to}`;
    default:
      return `${check.from} pings ${check.to}`;
  }
}
