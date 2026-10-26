// Build mode's data: what the learner places on the canvas, and how it turns
// into the NetTopology the engine already understands. Everything the learner
// types is kept as the text they typed, so a half-finished address never
// blocks them; toTopology keeps only what the kernel would accept.

import type { Cidr } from "./ip";
import { contains, isLabSafe, networkOf, parseCidr, parseIp } from "./ip";
import type { NetDeviceKind, NetDeviceSpec, NetLinkSpec, NetRouteSpec, NetSocketSpec, NetTopology } from "./model";

// ---- the lab author's side: what can be placed, what must work -------------

export interface BuildPart {
  // Also the device id (and shell prompt) when `max` is 1, and the name a goal
  // uses to point at the device: "laptop", "router".
  id: string;
  kind: NetDeviceKind;
  label: string;
  max: number;
  // A switch's port count.
  ports?: number;
  // Services the device starts with, such as a web server's port 80.
  sockets?: NetSocketSpec[];
}

export type BuildGoal =
  // `from` can reach `to`, which is a part id (its address) or an address.
  | { id: string; label: string; kind: "ping"; from: string; to: string }
  // traceroute from `from` to `to` lists exactly these hops, ending at `to`.
  | { id: string; label: string; kind: "path"; from: string; to: string; hops: string[] }
  // `device` has an address inside `block`.
  | { id: string; label: string; kind: "address"; device: string; block: string };

export interface BuildSeedDevice {
  part: string;
  x: number;
  y: number;
  addrs?: Record<string, string>;
  gateway?: string;
  routes?: BuildRoute[];
  forwarding?: boolean;
}

// A finished canvas written compactly, for a lab's solution.
export interface BuildSeed {
  devices: BuildSeedDevice[];
  cables: BuildCable[];
}

export interface BuildSolution {
  seed: BuildSeed;
  steps: Array<{ text: string; why: string }>;
}

// ---- the learner's side: the canvas ---------------------------------------

export interface BuildRoute {
  dst: string;
  via: string;
}

export interface BuildDevice {
  id: string;
  part: string;
  kind: NetDeviceKind;
  label: string;
  // The centre of the device on the canvas.
  x: number;
  y: number;
  // Address text by interface name: { eth0: "192.168.1.23/24" }.
  addrs: Record<string, string>;
  gateway: string;
  routes: BuildRoute[];
  forwarding: boolean;
  ports: number;
}

export interface BuildCable {
  // "laptop.eth0" to "router.eth0".
  a: string;
  b: string;
}

export interface BuildState {
  devices: BuildDevice[];
  cables: BuildCable[];
}

export const CANVAS_W = 640;
export const CANVAS_H = 360;
export const NODE_W = 112;
export const NODE_H = 56;
export const HOST_NICS = 2;
export const ROUTER_NICS = 4;
export const DEFAULT_PORTS = 4;

export const emptyBuild = (): BuildState => ({ devices: [], cables: [] });

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function clampPoint(x: number, y: number): { x: number; y: number } {
  return {
    // The right edge keeps room for the cable handle that hangs off a device.
    x: Math.round(clamp(x, NODE_W / 2 + 4, CANVAS_W - NODE_W / 2 - 20)),
    y: Math.round(clamp(y, NODE_H / 2 + 4, CANVAS_H - NODE_H / 2 - 4)),
  };
}

export function partById(parts: BuildPart[], id: string): BuildPart | undefined {
  return parts.find((p) => p.id === id);
}

export function placedCount(state: BuildState, partId: string): number {
  return state.devices.filter((d) => d.part === partId).length;
}

export function deviceById(state: BuildState, id: string): BuildDevice | undefined {
  return state.devices.find((d) => d.id === id);
}

// ---- placing and moving -----------------------------------------------------

// The first spot on a loose grid that no device already covers.
export function nextSlot(state: BuildState): { x: number; y: number } {
  for (const y of [70, 180, 290]) {
    for (const x of [80, 240, 400, 560]) {
      const taken = state.devices.some((d) => Math.abs(d.x - x) < NODE_W && Math.abs(d.y - y) < NODE_H);
      if (!taken) return { x, y };
    }
  }
  return { x: 80, y: 70 };
}

export function addDevice(state: BuildState, part: BuildPart, x: number, y: number): { state: BuildState; device: BuildDevice } | null {
  if (placedCount(state, part.id) >= part.max) return null;
  let n = 1;
  const taken = new Set(state.devices.map((d) => d.id));
  while (part.max > 1 && taken.has(`${part.id}${n}`)) n += 1;
  const id = part.max === 1 ? part.id : `${part.id}${n}`;
  const at = clampPoint(x, y);
  const device: BuildDevice = {
    id,
    part: part.id,
    kind: part.kind,
    label: part.max === 1 ? part.label : `${part.label} ${n}`,
    ...at,
    addrs: {},
    gateway: "",
    routes: [],
    forwarding: part.kind === "router",
    ports: part.ports ?? DEFAULT_PORTS,
  };
  return { state: { ...state, devices: [...state.devices, device] }, device };
}

export function moveDevice(state: BuildState, id: string, x: number, y: number): BuildState {
  const at = clampPoint(x, y);
  return { ...state, devices: state.devices.map((d) => (d.id === id ? { ...d, ...at } : d)) };
}

export function updateDevice(state: BuildState, id: string, change: (d: BuildDevice) => BuildDevice): BuildState {
  return { ...state, devices: state.devices.map((d) => (d.id === id ? change(d) : d)) };
}

export function removeDevice(state: BuildState, id: string): BuildState {
  return {
    devices: state.devices.filter((d) => d.id !== id),
    cables: state.cables.filter((c) => endpointDevice(c.a) !== id && endpointDevice(c.b) !== id),
  };
}

export function removeCable(state: BuildState, a: string): BuildState {
  return { ...state, cables: state.cables.filter((c) => c.a !== a) };
}

// ---- interfaces and cables --------------------------------------------------

export const endpointDevice = (end: string) => end.slice(0, end.indexOf("."));
export const endpointIface = (end: string) => end.slice(end.indexOf(".") + 1);

const ifaceIndex = (name: string) => Number(name.replace(/\D/g, ""));

// Every interface a device could have, in order: eth0, eth1 or p1, p2.
export function ifaceSlots(device: BuildDevice): string[] {
  if (device.kind === "switch") return Array.from({ length: device.ports }, (_, i) => `p${i + 1}`);
  const count = device.kind === "router" ? ROUTER_NICS : HOST_NICS;
  return Array.from({ length: count }, (_, i) => `eth${i}`);
}

export function cabledIfaces(state: BuildState, deviceId: string): string[] {
  const names: string[] = [];
  for (const c of state.cables) {
    for (const end of [c.a, c.b]) if (endpointDevice(end) === deviceId) names.push(endpointIface(end));
  }
  return names;
}

export function freeIface(state: BuildState, device: BuildDevice): string | null {
  const used = new Set(cabledIfaces(state, device.id));
  return ifaceSlots(device).find((name) => !used.has(name)) ?? null;
}

// The far end of the cable plugged into `end`, if any.
export function peerEnd(state: BuildState, end: string): string | null {
  for (const c of state.cables) {
    if (c.a === end) return c.b;
    if (c.b === end) return c.a;
  }
  return null;
}

export function addCable(state: BuildState, fromId: string, toId: string): { state: BuildState; cable: BuildCable } | { error: string } {
  const from = deviceById(state, fromId);
  const to = deviceById(state, toId);
  if (!from || !to) return { error: "A cable needs two devices on the canvas." };
  if (from.id === to.id) return { error: "A cable joins two different devices." };
  const joined = state.cables.some((c) => [endpointDevice(c.a), endpointDevice(c.b)].sort().join() === [from.id, to.id].sort().join());
  if (joined) return { error: `${from.label} and ${to.label} are already cabled together.` };
  const a = freeIface(state, from);
  if (!a) return { error: `${from.label} has no free ${from.kind === "switch" ? "port" : "interface"}.` };
  const b = freeIface(state, to);
  if (!b) return { error: `${to.label} has no free ${to.kind === "switch" ? "port" : "interface"}.` };
  const cable = { a: `${from.id}.${a}`, b: `${to.id}.${b}` };
  return { state: { ...state, cables: [...state.cables, cable] }, cable };
}

// "Laptop eth0" for "laptop.eth0".
export function describeEnd(state: BuildState, end: string): string {
  const device = deviceById(state, endpointDevice(end));
  return `${device?.label ?? endpointDevice(end)} ${endpointIface(end)}`;
}

// ---- checking what the learner types ---------------------------------------

export function checkAddress(text: string): string | null {
  const value = text.trim();
  if (!value) return null;
  const c = parseCidr(value);
  if (!c) return `Error: inet prefix is expected rather than "${value}".`;
  if (!isLabSafe(c.addr)) return "This lab only uses private (10.x, 172.16.x, 192.168.x) and documentation (203.0.113.x) addresses.";
  return null;
}

// The addresses on a device that the kernel would accept.
export function deviceCidrs(device: BuildDevice): Cidr[] {
  return Object.values(device.addrs)
    .filter((t) => checkAddress(t) === null && t.trim() !== "")
    .map((t) => parseCidr(t) as Cidr);
}

export function checkGateway(device: BuildDevice, text: string): string | null {
  const value = text.trim();
  if (!value) return null;
  const via = parseIp(value);
  if (via === null) return `Error: inet address is expected rather than "${value}".`;
  if (!deviceCidrs(device).some((c) => contains(c, via))) return "Error: Nexthop has invalid gateway.";
  return null;
}

export function checkRoute(device: BuildDevice, index: number): string | null {
  const route = device.routes[index];
  const dst = route.dst.trim();
  const via = route.via.trim();
  if (!dst && !via) return null;
  if (dst !== "default" && !parseCidr(dst.includes("/") ? dst : `${dst}/32`)) return `Error: inet prefix is expected rather than "${dst}".`;
  if (!via) return 'Error: either "dev" is required, or "via" is missing.';
  const problem = checkGateway(device, via);
  if (problem) return problem;
  const norm = (t: string) => (t === "default" ? "default" : formatDst(t));
  const same = (other: string) => norm(other.trim()) === norm(dst);
  if (device.routes.slice(0, index).some((r) => same(r.dst)) || (dst === "default" && device.gateway.trim() !== "")) {
    return "RTNETLINK answers: File exists";
  }
  return null;
}

function formatDst(text: string): string {
  const c = parseCidr(text.includes("/") ? text : `${text}/32`);
  return c ? `${networkOf(c)}/${c.prefix}` : text;
}

// ---- canvas to topology -----------------------------------------------------

// The interface names a device ends up with: every cabled one, plus any other
// that has a usable address, in order.
export function ifaceNamesOf(state: BuildState, device: BuildDevice): string[] {
  const names = new Set(cabledIfaces(state, device.id));
  for (const [name, text] of Object.entries(device.addrs)) {
    if (text.trim() !== "" && checkAddress(text) === null) names.add(name);
  }
  return [...names].sort((x, y) => ifaceIndex(x) - ifaceIndex(y));
}

export function toTopology(state: BuildState, parts: BuildPart[] = []): NetTopology {
  const devices: NetDeviceSpec[] = state.devices.map((d) => {
    const base = { id: d.id, kind: d.kind, label: d.label, x: d.x, y: d.y };
    if (d.kind === "switch") {
      const used = cabledIfaces(state, d.id).map(ifaceIndex);
      return { ...base, ports: Math.max(d.ports, ...used) };
    }
    const routes: NetRouteSpec[] = [];
    if (d.gateway.trim() && checkGateway(d, d.gateway) === null) routes.push({ dst: "default", via: d.gateway.trim() });
    d.routes.forEach((r, i) => {
      if (r.dst.trim() && r.via.trim() && checkRoute(d, i) === null) routes.push({ dst: r.dst.trim(), via: r.via.trim() });
    });
    const spec: NetDeviceSpec = {
      ...base,
      ifaces: ifaceNamesOf(state, d).map((name) => {
        const text = (d.addrs[name] ?? "").trim();
        return text && checkAddress(text) === null ? { name, addr: text } : { name };
      }),
      routes,
    };
    if (d.kind === "router") spec.forwarding = d.forwarding;
    const sockets = partById(parts, d.part)?.sockets;
    if (sockets) spec.sockets = sockets;
    return spec;
  });
  const links: NetLinkSpec[] = state.cables.map((c) => ({ a: c.a, b: c.b }));
  return { devices, links };
}

// ---- a compact seed to a canvas ---------------------------------------------

// Places each seed device in order (so ids come out as they do for a learner)
// and plugs the cables in as given.
export function seedToState(seed: BuildSeed, parts: BuildPart[]): BuildState {
  let state = emptyBuild();
  for (const s of seed.devices) {
    const part = partById(parts, s.part);
    if (!part) continue;
    const added = addDevice(state, part, s.x, s.y);
    if (!added) continue;
    state = updateDevice(added.state, added.device.id, (d) => ({
      ...d,
      addrs: { ...(s.addrs ?? {}) },
      gateway: s.gateway ?? "",
      routes: (s.routes ?? []).map((r) => ({ ...r })),
      forwarding: s.forwarding ?? d.forwarding,
    }));
  }
  return { ...state, cables: seed.cables.map((c) => ({ ...c })) };
}
