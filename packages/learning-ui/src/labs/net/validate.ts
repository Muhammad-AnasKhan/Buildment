// The guard for a network lab's data, run by the registry test over every
// registered net lab. It reports problems rather than throwing, like
// validateLabSpec for the other families.

import type { NetSolution } from "../types";
import type { NetCheck } from "./checks";
import { runChecks } from "./checks";
import { runCommand } from "./commands";
import type { NetDeviceSpec, NetTopology } from "./model";
import { buildWorld, parseEndpoint } from "./model";
import type { PlanSpec } from "./plan";
import { checkPlan } from "./plan";
import { isLabSafe, parseCidr, parseIp } from "./ip";

export function validateTopology(topology: NetTopology): string[] {
  const problems: string[] = [];
  const ifaces = new Map<string, Set<string>>();
  for (const device of topology.devices) {
    if (ifaces.has(device.id)) problems.push(`device id "${device.id}" is used twice`);
    if (!/^[a-z][a-z0-9-]*$/.test(device.id)) problems.push(`device id "${device.id}" must be lower case letters, digits and dashes (it becomes the shell prompt)`);
    const names =
      device.kind === "switch"
        ? Array.from({ length: device.ports ?? 4 }, (_, i) => `p${i + 1}`)
        : (device.ifaces ?? []).map((i) => i.name);
    ifaces.set(device.id, new Set(names));
    for (const iface of device.ifaces ?? []) {
      if (device.kind === "switch") problems.push(`switch "${device.id}" lists interfaces; give it ports instead`);
      if (!iface.addr) continue;
      const c = parseCidr(iface.addr);
      if (!c) problems.push(`${device.id}.${iface.name} address "${iface.addr}" is not address/prefix`);
      else if (!isLabSafe(c.addr)) problems.push(`${device.id}.${iface.name} uses ${iface.addr}; public addresses must come from 192.0.2.0/24, 198.51.100.0/24 or 203.0.113.0/24`);
    }
    for (const route of device.routes ?? []) {
      if (route.dst !== "default" && !parseCidr(route.dst)) problems.push(`${device.id} route "${route.dst}" is not default or a block`);
      if (route.via && parseIp(route.via) === null) problems.push(`${device.id} route via "${route.via}" is not an address`);
      if (!route.via && !route.dev) problems.push(`${device.id} route "${route.dst}" needs via or dev`);
    }
    for (const socket of device.sockets ?? []) {
      if (parseIp(socket.addr) === null) problems.push(`${device.id} socket address "${socket.addr}" is not an address`);
    }
    problems.push(...validateServices(device, names));
  }
  const used = new Set<string>();
  for (const link of topology.links) {
    for (const end of [link.a, link.b]) {
      const ep = parseEndpoint(end);
      if (!ep) {
        problems.push(`link end "${end}" must be device.interface`);
        continue;
      }
      if (!ifaces.get(ep.dev)?.has(ep.iface)) problems.push(`link end "${end}" names no such device interface`);
      if (used.has(end)) problems.push(`"${end}" has two cables plugged in`);
      used.add(end);
    }
  }
  return problems;
}

const HOSTNAME = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

// NAT, DHCP, DNS and resolver settings: the addresses must parse, be lab-safe,
// and the interfaces they name must exist.
function validateServices(device: NetDeviceSpec, names: string[]): string[] {
  const problems: string[] = [];
  const has = (iface: string) => names.includes(iface);
  const safe = (what: string, text: string) => {
    const addr = parseIp(text);
    if (addr === null) problems.push(`${device.id} ${what} "${text}" is not an address`);
    else if (!isLabSafe(addr)) problems.push(`${device.id} ${what} "${text}" must be a private or documentation address`);
  };
  for (const oif of device.nat?.masquerade ?? []) {
    if (!has(oif)) problems.push(`${device.id} masquerades out of "${oif}", which is not one of its interfaces`);
  }
  for (const d of device.nat?.dnat ?? []) {
    const [addr, port] = d.to.split(":");
    safe("port forward target", addr);
    if (port !== undefined && !/^\d+$/.test(port)) problems.push(`${device.id} port forward target "${d.to}" has a bad port`);
    if (d.in && !has(d.in)) problems.push(`${device.id} forwards a port arriving on "${d.in}", which is not one of its interfaces`);
  }
  const dhcp = device.dnsmasq?.dhcp;
  if (dhcp) {
    if (!has(dhcp.iface)) problems.push(`${device.id} runs DHCP on "${dhcp.iface}", which is not one of its interfaces`);
    safe("DHCP pool start", dhcp.start);
    safe("DHCP pool end", dhcp.end);
    for (const t of dhcp.taken ?? []) safe("leased address", t);
    if (dhcp.router) safe("DHCP router option", dhcp.router);
    if (dhcp.dns) safe("DHCP dns option", dhcp.dns);
  }
  const dns = device.dnsmasq?.dns;
  if (dns) {
    if (dns.iface && !has(dns.iface)) problems.push(`${device.id} answers DNS on "${dns.iface}", which is not one of its interfaces`);
    for (const [name, addr] of Object.entries(dns.records)) {
      if (!HOSTNAME.test(name)) problems.push(`${device.id} DNS name "${name}" is not a host name`);
      safe(`DNS answer for ${name}`, addr);
    }
  }
  for (const r of device.resolver ?? []) safe("resolver", r);
  return problems;
}

export function validateChecks(topology: NetTopology, checks: NetCheck[]): string[] {
  const byId = new Map(topology.devices.map((d) => [d.id, d]));
  const problems: string[] = [];
  for (const check of checks) {
    const from = byId.get(check.from);
    if (!from) problems.push(`check "${check.id}" starts from unknown device "${check.from}"`);
    if (check.kind === "link" || check.kind === "address") {
      if (from && !(from.ifaces ?? []).some((i) => i.name === check.to)) problems.push(`check "${check.id}" names interface "${check.to}", which ${check.from} does not have`);
      if (check.within && !parseCidr(check.within)) problems.push(`check "${check.id}" within "${check.within}" is not a block`);
    } else if (check.kind === "dns") {
      if (!HOSTNAME.test(check.to)) problems.push(`check "${check.id}" name "${check.to}" is not a host name`);
    } else if (parseIp(check.to) === null && !HOSTNAME.test(check.to)) {
      problems.push(`check "${check.id}" target "${check.to}" is not an address or a name`);
    }
    if (check.kind === "tcp" && !check.port) problems.push(`check "${check.id}" is tcp and needs a port`);
    if (check.expect === "refused" && check.kind !== "tcp") problems.push(`check "${check.id}" expects a refusal, which only a tcp check can see`);
    if ((check.seenAs || check.seenBy) && check.kind !== "tcp") problems.push(`check "${check.id}" says who sees the connection, which only a tcp check can tell`);
    if (check.seenAs && parseIp(check.seenAs) === null) problems.push(`check "${check.id}" seenAs "${check.seenAs}" is not an address`);
    if (check.seenBy && !byId.has(check.seenBy)) problems.push(`check "${check.id}" seenBy names unknown device "${check.seenBy}"`);
  }
  return problems;
}

export function validatePlan(plan: PlanSpec): string[] {
  const problems: string[] = [];
  const parent = parseCidr(plan.parent);
  if (!parent) problems.push(`plan parent "${plan.parent}" is not a block`);
  else if (!isLabSafe(parent.addr)) problems.push(`plan parent "${plan.parent}" must be a private or documentation block`);
  if (plan.needs.length === 0) problems.push("a plan needs at least one group");
  for (const need of plan.needs) {
    if (need.hosts < 1) problems.push(`plan group "${need.id}" needs at least one host`);
  }
  return problems;
}

// Proves a solution works: a fault lab's steps, run in order on the starting
// network, must make every check pass; a plan's blocks must all fit.
export function validateSolution(solution: NetSolution, lab: { topology?: NetTopology; checks?: NetCheck[]; plan?: PlanSpec }): string[] {
  const problems: string[] = [];
  if (solution.summary.trim().length === 0) problems.push("a solution needs a summary");
  if (lab.plan) {
    const blocks = solution.blocks ?? {};
    for (const need of lab.plan.needs) {
      if (!blocks[need.id]) problems.push(`the solution has no block for "${need.id}"`);
      else if (!blocks[need.id].why.trim()) problems.push(`the solution's block for "${need.id}" needs a why`);
    }
    const answers = Object.fromEntries(Object.entries(blocks).map(([id, b]) => [id, b.block]));
    const result = checkPlan(lab.plan, answers);
    for (const n of result.needs) if (!n.ok) problems.push(`the solution's block for "${n.id}" fails: ${n.problems.join(" ")}`);
    return problems;
  }
  if (!lab.topology) return problems;
  const world = buildWorld(lab.topology);
  for (const step of solution.steps ?? []) {
    if (!world.devices[step.device]) {
      problems.push(`solution step "${step.command}" runs on unknown device "${step.device}"`);
      continue;
    }
    if (!step.why.trim()) problems.push(`solution step "${step.command}" needs a why`);
    const result = runCommand(world, step.device, step.command);
    if (/^(Error|RTNETLINK|Cannot|Command ")/.test(result.output)) problems.push(`solution step "${step.command}" on ${step.device} fails: ${result.output}`);
  }
  if (lab.checks) {
    runChecks(world, lab.checks).forEach((r, i) => {
      if (!r.pass) problems.push(`after the solution, check "${lab.checks?.[i].id}" still fails`);
    });
  }
  return problems;
}
