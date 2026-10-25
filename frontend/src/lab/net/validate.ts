// The guard for a network lab's data, run by the registry test over every
// registered net lab. It reports problems rather than throwing, like
// validateLabSpec for the other families.

import type { NetCheck } from "./checks";
import type { NetTopology } from "./model";
import { parseEndpoint } from "./model";
import type { PlanSpec } from "./plan";
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

export function validateChecks(topology: NetTopology, checks: NetCheck[]): string[] {
  const ids = new Set(topology.devices.map((d) => d.id));
  const problems: string[] = [];
  for (const check of checks) {
    if (!ids.has(check.from)) problems.push(`check "${check.id}" starts from unknown device "${check.from}"`);
    if (parseIp(check.to) === null) problems.push(`check "${check.id}" target "${check.to}" is not an address`);
    if (check.kind === "tcp" && !check.port) problems.push(`check "${check.id}" is tcp and needs a port`);
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
