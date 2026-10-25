// The network lab's data contract and runtime state. A lab author writes a
// NetTopology; buildWorld turns it into a World the engine and the command
// generator read and change. Everything here is plain data so a World can be
// cloned for a check run without touching what the learner sees.

import type { Cidr } from "./ip";
import { contains, networkOf, parseCidr, parseIp } from "./ip";

export type NetDeviceKind = "host" | "router" | "switch";

export interface NetIfaceSpec {
  name: string;
  // Address with its prefix, as `ip addr add` takes it: "192.168.1.23/24".
  addr?: string;
  mac?: string;
  up?: boolean;
}

export interface NetRouteSpec {
  // "default" or a block such as "10.2.0.0/24".
  dst: string;
  via?: string;
  dev?: string;
  metric?: number;
}

export interface NetSocketSpec {
  proto: "tcp" | "udp";
  // The listening address: "0.0.0.0", "127.0.0.1" or one of the host's own.
  addr: string;
  port: number;
  process: string;
  // What curl prints when it connects.
  reply?: string;
}

export interface NetFilterRule {
  action: "drop" | "accept";
  in?: string;
  out?: string;
  src?: string;
  dst?: string;
}

export interface NetDeviceSpec {
  id: string;
  kind: NetDeviceKind;
  label: string;
  x: number;
  y: number;
  ifaces?: NetIfaceSpec[];
  // A switch's port count; ports are named p1, p2 and so on.
  ports?: number;
  routes?: NetRouteSpec[];
  sockets?: NetSocketSpec[];
  // Routers forward by default and hosts do not (net.ipv4.ip_forward).
  forwarding?: boolean;
  // A router that forwards but never sends ICMP errors.
  silent?: boolean;
  // Forward rules, first match wins, anything unmatched is accepted.
  filter?: NetFilterRule[];
}

export interface NetLinkSpec {
  // "laptop.eth0" to "sw1.p1".
  a: string;
  b: string;
}

export interface NetTopology {
  devices: NetDeviceSpec[];
  links: NetLinkSpec[];
}

export interface IfaceState {
  name: string;
  mac: string;
  addrs: Cidr[];
  up: boolean;
}

export interface RouteState {
  dst: Cidr;
  via?: number;
  dev: string;
  metric: number;
  // Connected routes come from an interface address; the kernel adds and
  // removes them, and `ip route` prints them with "proto kernel scope link".
  connected?: boolean;
  src?: number;
}

export interface NeighState {
  ip: number;
  dev: string;
  mac: string | null;
  state: "REACHABLE" | "STALE" | "FAILED";
}

export interface SocketState {
  proto: "tcp" | "udp";
  addr: number;
  port: number;
  process: string;
  pid: number;
  reply?: string;
}

export interface DeviceState {
  id: string;
  kind: NetDeviceKind;
  label: string;
  ifaces: IfaceState[];
  // Static routes only; connected routes are derived in routesOf.
  routes: RouteState[];
  sockets: SocketState[];
  forwarding: boolean;
  silent: boolean;
  filter: NetFilterRule[];
  neigh: NeighState[];
  // Switches only: which port each MAC was last seen on.
  macTable: Record<string, string>;
}

export interface Endpoint {
  dev: string;
  iface: string;
}

export interface LinkState {
  a: Endpoint;
  b: Endpoint;
}

export interface World {
  devices: Record<string, DeviceState>;
  links: LinkState[];
}

export const BROADCAST_MAC = "ff:ff:ff:ff:ff:ff";

export function parseEndpoint(text: string): Endpoint | null {
  const dot = text.indexOf(".");
  if (dot <= 0 || dot === text.length - 1) return null;
  return { dev: text.slice(0, dot), iface: text.slice(dot + 1) };
}

const hex = (n: number) => n.toString(16).padStart(2, "0");

// Locally administered MACs (02:...), stable for a given device and interface.
function labMac(deviceIndex: number, ifaceIndex: number): string {
  return `02:00:00:00:${hex(deviceIndex + 1)}:${hex(ifaceIndex + 1)}`;
}

export const DEFAULT_CIDR: Cidr = { addr: 0, prefix: 0 };

function parseDst(text: string): Cidr | null {
  if (text === "default") return DEFAULT_CIDR;
  const c = parseCidr(text);
  return c ? { addr: networkOf(c), prefix: c.prefix } : null;
}

export function buildWorld(topology: NetTopology): World {
  const devices: Record<string, DeviceState> = {};
  topology.devices.forEach((spec, index) => {
    const ifaces: IfaceState[] =
      spec.kind === "switch"
        ? Array.from({ length: spec.ports ?? 4 }, (_, i) => ({ name: `p${i + 1}`, mac: labMac(index, i), addrs: [], up: true }))
        : (spec.ifaces ?? []).map((iface, i) => {
            const c = iface.addr ? parseCidr(iface.addr) : null;
            return { name: iface.name, mac: iface.mac ?? labMac(index, i), addrs: c ? [c] : [], up: iface.up ?? true };
          });
    const device: DeviceState = {
      id: spec.id,
      kind: spec.kind,
      label: spec.label,
      ifaces,
      routes: [],
      sockets: (spec.sockets ?? []).map((s, i) => ({
        proto: s.proto,
        addr: parseIp(s.addr) ?? 0,
        port: s.port,
        process: s.process,
        pid: 100 + i * 7,
        reply: s.reply,
      })),
      forwarding: spec.forwarding ?? spec.kind === "router",
      silent: spec.silent ?? false,
      filter: spec.filter ?? [],
      neigh: [],
      macTable: {},
    };
    for (const r of spec.routes ?? []) {
      const dst = parseDst(r.dst);
      const via = r.via ? parseIp(r.via) ?? undefined : undefined;
      if (!dst) continue;
      const dev = r.dev ?? (via !== undefined ? onLinkIface(device, via)?.name : undefined);
      if (!dev) continue;
      device.routes.push({ dst, via, dev, metric: r.metric ?? 0 });
    }
    devices[spec.id] = device;
  });
  const links: LinkState[] = [];
  for (const link of topology.links) {
    const a = parseEndpoint(link.a);
    const b = parseEndpoint(link.b);
    if (a && b) links.push({ a, b });
  }
  return { devices, links };
}

export function cloneWorld(world: World): World {
  return structuredClone(world);
}

export function ifaceOf(device: DeviceState, name: string): IfaceState | undefined {
  return device.ifaces.find((i) => i.name === name);
}

// The up interface whose own block contains ip, if any.
export function onLinkIface(device: DeviceState, ip: number): IfaceState | undefined {
  return device.ifaces.find((i) => i.up && i.addrs.some((a) => contains(a, ip)));
}

export function isLocalAddress(device: DeviceState, ip: number): boolean {
  if (ip >>> 24 === 127) return true;
  return device.ifaces.some((i) => i.addrs.some((a) => a.addr === ip));
}

// The full table as the kernel would use it: connected routes for each up
// interface address, then static routes whose interface is up.
export function routesOf(device: DeviceState): RouteState[] {
  const connected: RouteState[] = [];
  for (const iface of device.ifaces) {
    if (!iface.up) continue;
    for (const a of iface.addrs) {
      if (a.prefix === 32) continue;
      connected.push({ dst: { addr: networkOf(a), prefix: a.prefix }, dev: iface.name, metric: 0, connected: true, src: a.addr });
    }
  }
  const statics = device.routes.filter((r) => ifaceOf(device, r.dev)?.up);
  return [...connected, ...statics];
}

// Longest prefix wins, then the lowest metric; the table's order never decides.
export function lookupRoute(device: DeviceState, dst: number): RouteState | null {
  let best: RouteState | null = null;
  for (const route of routesOf(device)) {
    if (!contains(route.dst, dst)) continue;
    if (!best || route.dst.prefix > best.dst.prefix || (route.dst.prefix === best.dst.prefix && route.metric < best.metric)) {
      best = route;
    }
  }
  return best;
}

// The source address the kernel picks for a route: the route's own src, or the
// first address on its interface (preferring one in the same block as the
// next hop).
export function sourceFor(device: DeviceState, route: RouteState): number | null {
  if (route.src !== undefined) return route.src;
  const iface = ifaceOf(device, route.dev);
  if (!iface || iface.addrs.length === 0) return null;
  const hop = route.via;
  const near = hop !== undefined ? iface.addrs.find((a) => contains(a, hop)) : undefined;
  return (near ?? iface.addrs[0]).addr;
}

// Which device and interface sit at the far end of the cable plugged into ep.
export function peerOf(world: World, ep: Endpoint): Endpoint | null {
  for (const link of world.links) {
    if (link.a.dev === ep.dev && link.a.iface === ep.iface) return link.b;
    if (link.b.dev === ep.dev && link.b.iface === ep.iface) return link.a;
  }
  return null;
}

export function linkIndexOf(world: World, ep: Endpoint): number {
  return world.links.findIndex(
    (l) => (l.a.dev === ep.dev && l.a.iface === ep.iface) || (l.b.dev === ep.dev && l.b.iface === ep.iface),
  );
}
