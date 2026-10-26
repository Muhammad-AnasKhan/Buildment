// Scores a built network against a lab's goals. Pass or fail comes from the
// engine itself (reaches, and the traceroute command); the reason for a
// failure is read from where the packet actually stopped, so the learner is
// told what is wrong rather than only that something is.

import type { BuildGoal } from "./build-model";
import { reaches } from "./checks";
import { runCommand } from "./commands";
import { newRun, sendIp, sourceAddress } from "./engine";
import type { DeviceState, World } from "./model";
import { cloneWorld, isLocalAddress, lookupRoute, peerOf } from "./model";
import { contains, formatIp, networkOf, parseCidr, parseIp } from "./ip";

export interface GoalResult {
  id: string;
  pass: boolean;
  reason: string;
}

// Part id to the name shown for it: { laptop: "Laptop" }.
export type GoalNames = Record<string, string>;

const nameOf = (names: GoalNames, id: string) => names[id] ?? id;

// A device's own address: the first one on an interface that is up.
function addressOf(device: DeviceState): number | null {
  for (const iface of device.ifaces) {
    if (iface.up && iface.addrs.length > 0) return iface.addrs[0].addr;
  }
  return null;
}

interface Target {
  ip: number | null;
  problem?: string;
}

function resolve(world: World, names: GoalNames, ref: string): Target {
  const literal = parseIp(ref);
  if (literal !== null) return { ip: literal };
  const device = world.devices[ref];
  if (!device) return { ip: null, problem: `Add the ${nameOf(names, ref)} to the canvas.` };
  const ip = addressOf(device);
  if (ip === null) return { ip: null, problem: `The ${nameOf(names, ref)} has no address yet.` };
  return { ip };
}

const STOPS = new Set(["local-error", "arp-failed", "no-route", "not-forwarding", "filtered", "no-route-back", "ttl-expired"]);

// Why a ping from `from` to `dst` does not come back.
function whyNot(world: World, names: GoalNames, from: string, dst: number, literal: boolean): string {
  const copy = cloneWorld(world);
  const device = copy.devices[from];
  const who = nameOf(names, from);
  if (!device.ifaces.some((i) => i.addrs.length > 0)) return `The ${who} has no address yet. Select it and set one on its interface.`;
  const route = lookupRoute(device, dst);
  if (!route) return `The ${who} has no route to ${formatIp(dst)}. Give it an address on the same network, or a default gateway.`;
  if (!peerOf(world, { dev: from, iface: route.dev })) return `The ${who} sends ${formatIp(dst)} out of ${route.dev}, but nothing is plugged into ${route.dev}. Draw a cable from it.`;
  if (literal && !Object.values(world.devices).some((d) => isLocalAddress(d, dst))) return `Nothing on the canvas has the address ${formatIp(dst)}.`;
  const src = sourceAddress(device, dst);
  if (src === null) return `The ${who} has no source address for ${formatIp(dst)}.`;
  const run = newRun();
  sendIp(copy, run, from, { src, dst, ttl: 64, kind: "echo-request", seq: 1 });
  const stop = run.events.find((e) => STOPS.has(e.kind));
  return stop ? stop.text : "The ping went out but no reply came back.";
}

// The first address on each line of traceroute -n, or null for a silent hop.
function hopsOf(output: string): Array<number | null> {
  const hops: Array<number | null> = [];
  for (const line of output.split("\n")) {
    const m = /^\s*(\d+)\s+(.*)$/.exec(line);
    if (!m) continue;
    const found = /\b(\d{1,3}(?:\.\d{1,3}){3})\b/.exec(m[2]);
    hops.push(found ? parseIp(found[1]) : null);
  }
  return hops;
}

function isHop(world: World, ref: string, ip: number | null): boolean {
  if (ip === null) return false;
  const literal = parseIp(ref);
  if (literal !== null) return literal === ip;
  const device = world.devices[ref];
  return !!device && isLocalAddress(device, ip);
}

function evaluate(world: World, goal: BuildGoal, names: GoalNames): GoalResult {
  const fail = (reason: string): GoalResult => ({ id: goal.id, pass: false, reason });
  const pass = (reason: string): GoalResult => ({ id: goal.id, pass: true, reason });

  if (goal.kind === "address") {
    const device = world.devices[goal.device];
    const who = nameOf(names, goal.device);
    if (!device) return fail(`Add the ${who} to the canvas.`);
    const block = parseCidr(goal.block);
    const mine = device.ifaces.flatMap((i) => i.addrs);
    if (!block) return fail(`${goal.block} is not a block.`);
    const hit = mine.find((a) => contains(block, a.addr));
    if (hit) return pass(`The ${who} is ${formatIp(hit.addr)}, inside ${formatIp(networkOf(block))}/${block.prefix}.`);
    return fail(mine.length === 0 ? `The ${who} has no address yet. Give it one inside ${goal.block}.` : `The ${who} is ${formatIp(mine[0].addr)}, which is outside ${goal.block}.`);
  }

  const from = world.devices[goal.from];
  if (!from) return fail(`Add the ${nameOf(names, goal.from)} to the canvas.`);
  const target = resolve(world, names, goal.to);
  if (target.ip === null) return fail(target.problem ?? "No address to reach.");
  const literal = parseIp(goal.to) !== null;
  const dst = formatIp(target.ip);

  if (!reaches(world, goal.from, dst, "ping")) return fail(whyNot(world, names, goal.from, target.ip, literal));
  if (goal.kind === "ping") return pass(`${nameOf(names, goal.from)} got a reply from ${dst}.`);

  const trace = runCommand(cloneWorld(world), goal.from, `traceroute -n ${dst}`);
  const seen = hopsOf(trace.output);
  const ok = seen.length === goal.hops.length && goal.hops.every((ref, i) => isHop(world, ref, seen[i]));
  const shown = seen.length === 0 ? "nothing" : seen.map((h) => (h === null ? "*" : formatIp(h))).join(", then ");
  const wanted = goal.hops.map((ref) => (parseIp(ref) !== null ? ref : `the ${nameOf(names, ref)}`)).join(", then ");
  if (ok) return pass(`traceroute lists ${shown}.`);
  return fail(`traceroute -n ${dst} lists ${shown}, but this goal wants ${wanted}.`);
}

export function evaluateGoals(world: World, goals: BuildGoal[], names: GoalNames = {}): GoalResult[] {
  return goals.map((goal) => evaluate(world, goal, names));
}
