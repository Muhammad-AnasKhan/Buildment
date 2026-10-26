// Reachability checks for a network lab: "A can ping B", "the guest cannot
// reach the office". Each check runs on a copy of the World so checking never
// changes the neighbour tables the learner is looking at.

import { newRun, sendIp, sourceAddress } from "./engine";
import type { World } from "./model";
import { cloneWorld } from "./model";
import { parseIp } from "./ip";

export interface NetCheck {
  id: string;
  label: string;
  from: string;
  to: string;
  kind: "ping" | "tcp";
  port?: number;
  expect: "reach" | "blocked";
}

export interface NetCheckResult {
  id: string;
  pass: boolean;
  reached: boolean;
}

export function reaches(world: World, from: string, to: string, kind: "ping" | "tcp", port?: number): boolean {
  const copy = cloneWorld(world);
  const device = copy.devices[from];
  const dst = parseIp(to);
  if (!device || dst === null) return false;
  const src = sourceAddress(device, dst);
  if (src === null) return false;
  const run = newRun();
  const sent = kind === "ping" ? "echo-request" : "tcp-syn";
  sendIp(copy, run, from, { src, dst, ttl: 64, kind: sent, seq: 1, sport: 45000, dport: port });
  const want = kind === "ping" ? "echo-reply" : "tcp-syn-ack";
  return run.arrivals.some((a) => a.device === from && a.packet.kind === want && a.packet.src === dst);
}

export function runChecks(world: World, checks: NetCheck[]): NetCheckResult[] {
  return checks.map((check) => {
    const reached = reaches(world, check.from, check.to, check.kind, check.port);
    return { id: check.id, reached, pass: reached === (check.expect === "reach") };
  });
}

export function describeTarget(check: NetCheck): string {
  return check.kind === "tcp" ? `${check.to}:${check.port}` : check.to;
}

