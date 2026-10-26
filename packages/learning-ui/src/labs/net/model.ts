// The network lab's data contract and runtime state. A lab author writes a
// NetTopology; buildWorld turns it into a World the engine and the command
// generator read and change. Everything here is plain data so a World can be
// cloned for a check run without touching what the learner sees.

import type { Cidr } from "./ip";
import { contains, networkOf, parseCidr, parseIp } from "./ip";
import { buildNftState } from "./nft";

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

// A port forward: traffic arriving on `in` for proto/port goes to an inside
// host, "192.168.1.20:80".
export interface NetDnatSpec {
  in?: string;
  proto: "tcp" | "udp";
  port: number;
  to: string;
}

// Network address translation on a router, as nftables rules in a table named
// nat: masquerade out of the listed interfaces, plus port forwards.
export interface NetNatSpec {
  masquerade?: string[];
  dnat?: NetDnatSpec[];
}

// The DHCP half of dnsmasq: a pool on one interface and what the lease says.
export interface NetDhcpSpec {
  iface: string;
  start: string;
  end: string;
  // Lease time in seconds (3600 when omitted).
  lease?: number;
  // Both default to the router's own address on the interface.
  router?: string;
  dns?: string;
  // Addresses already leased to other devices, so the pool can run out.
  taken?: string[];
}

// The DNS half: a table of names (dnsmasq address=/name/ip).
export interface NetDnsSpec {
  // Listen on this interface only; every interface when omitted.
  iface?: string;
  records: Record<string, string>;
  // What a name that is not in the table gets. dnsmasq without an upstream
  // answers REFUSED; a real zone answers NXDOMAIN.
  unknown?: "nxdomain" | "refused";
}

export interface NetDnsmasqSpec {
  // false means the service is stopped (systemctl start dnsmasq).
  running?: boolean;
  dhcp?: NetDhcpSpec;
  dns?: NetDnsSpec;
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
  // Forward rules, first match wins, anything unmatched is accepted. Giving
  // the list (even an empty one) creates the filter table with its forward
  // chain; leaving it out means the device has no such table.
  filter?: NetFilterRule[];
  nat?: NetNatSpec;
  dnsmasq?: NetDnsmasqSpec;
  // The nameservers in /etc/resolv.conf. Leaving it out means no file.
  resolver?: string[];
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
  // Set when the address came from a DHCP lease (udhcpc).
  lease?: { server: number; seconds: number };
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

// ---- nftables and conntrack ----------------------------------------------

export type NftHook = "prerouting" | "postrouting" | "forward" | "input" | "output";

export interface NftRule {
  handle: number;
  iif?: string;
  oif?: string;
  saddr?: Cidr;
  daddr?: Cidr;
  proto?: "tcp" | "udp";
  dport?: number;
  action: "masquerade" | "dnat" | "drop" | "accept";
  to?: { ip: number; port?: number };
}

export interface NftChain {
  name: string;
  handle: number;
  type: "nat" | "filter";
  hook: NftHook;
  // nft prints -100, 100 and 0 as dstnat, srcnat and filter.
  priority: number;
  policy: "accept" | "drop";
  rules: NftRule[];
}

export interface NftTable {
  family: "ip";
  name: string;
  handle: number;
  // Chains and rules in one table share a counter, as nft -a shows.
  nextHandle: number;
  chains: NftChain[];
}

// One side of a tracked connection. For ICMP echo the id sits in both ports.
export interface Tuple {
  src: number;
  dst: number;
  sport: number;
  dport: number;
}

export interface ConntrackEntry {
  proto: "tcp" | "udp" | "icmp";
  orig: Tuple;
  reply: Tuple;
  state: "SYN_SENT" | "TIME_WAIT" | "CLOSE" | "UNREPLIED" | "REPLIED";
  assured: boolean;
}

export interface DhcpLease {
  mac: string;
  ip: number;
}

export interface DnsmasqState {
  running: boolean;
  dhcp?: { iface: string; start: number; end: number; lease: number; router?: number; dns?: number; leases: DhcpLease[] };
  dns?: { iface?: string; records: Record<string, number>; unknown: "nxdomain" | "refused" };
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
  nft: NftTable[];
  conntrack: ConntrackEntry[];
  dnsmasq?: DnsmasqState;
  // Nameservers in /etc/resolv.conf; undefined when the file does not exist.
  resolver?: number[];
  // Counts the source ports this device has handed out, so each is stable.
  portSeq: number;
  nextTableHandle: number;
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
      nft: [],
      conntrack: [],
      portSeq: 0,
      nextTableHandle: 1,
      neigh: [],
      macTable: {},
    };
    buildNftState(device, spec);
    buildDnsmasq(device, spec);
    if (spec.resolver) device.resolver = spec.resolver.map((r) => parseIp(r) ?? 0);
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

function buildDnsmasq(device: DeviceState, spec: NetDeviceSpec) {
  const d = spec.dnsmasq;
  if (!d) return;
  const state: DnsmasqState = { running: d.running ?? true };
  if (d.dhcp) {
    const taken = (d.dhcp.taken ?? []).map((t, i) => ({ mac: `02:ee:00:00:00:${hex(i + 1)}`, ip: parseIp(t) ?? 0 }));
    state.dhcp = {
      iface: d.dhcp.iface,
      start: parseIp(d.dhcp.start) ?? 0,
      end: parseIp(d.dhcp.end) ?? 0,
      lease: d.dhcp.lease ?? 3600,
      router: d.dhcp.router ? parseIp(d.dhcp.router) ?? undefined : undefined,
      dns: d.dhcp.dns ? parseIp(d.dhcp.dns) ?? undefined : undefined,
      leases: taken,
    };
  }
  if (d.dns) {
    const records: Record<string, number> = {};
    for (const [name, addr] of Object.entries(d.dns.records)) records[name.toLowerCase().replace(/\.$/, "")] = parseIp(addr) ?? 0;
    state.dns = { iface: d.dns.iface, records, unknown: d.dns.unknown ?? "nxdomain" };
  }
  device.dnsmasq = state;
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

// True when the cable on this interface leads to an interface that is up.
export function hasCarrier(world: World, device: DeviceState, iface: IfaceState): boolean {
  const peer = peerOf(world, { dev: device.id, iface: iface.name });
  if (!peer) return false;
  return ifaceOf(world.devices[peer.dev], peer.iface)?.up ?? false;
}

// Every non-switch interface that hears a broadcast sent out of ep: the far end
// of the cable and, through any switches, every other plugged-in port.
export function broadcastDomain(world: World, ep: Endpoint): Endpoint[] {
  const self = ifaceOf(world.devices[ep.dev], ep.iface);
  if (!self?.up) return [];
  const found: Endpoint[] = [];
  const seen = new Set<string>();
  const visit = (from: Endpoint) => {
    const peer = peerOf(world, from);
    if (!peer) return;
    const device = world.devices[peer.dev];
    const iface = device && ifaceOf(device, peer.iface);
    if (!device || !iface?.up) return;
    if (device.kind !== "switch") {
      found.push(peer);
      return;
    }
    if (seen.has(device.id)) return;
    seen.add(device.id);
    for (const port of device.ifaces) {
      if (port.name !== peer.iface && port.up) visit({ dev: device.id, iface: port.name });
    }
  };
  visit(ep);
  return found;
}

// A stable source port for the next connection a device opens.
export function nextEphemeralPort(device: DeviceState): number {
  const base = [...device.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const port = 32768 + ((base * 7919 + device.portSeq * 1031) % 28000);
  device.portSeq += 1;
  return port;
}

// What a device listens on: its own sockets plus dnsmasq while it is running.
export function socketsOf(device: DeviceState): SocketState[] {
  const extra: SocketState[] = [];
  const d = device.dnsmasq;
  if (d?.running) {
    if (d.dns) {
      const iface = d.dns.iface ? ifaceOf(device, d.dns.iface) : undefined;
      const addr = iface?.addrs[0]?.addr ?? 0;
      extra.push({ proto: "udp", addr, port: 53, process: "dnsmasq", pid: 412 }, { proto: "tcp", addr, port: 53, process: "dnsmasq", pid: 412 });
    }
    if (d.dhcp) extra.push({ proto: "udp", addr: 0, port: 67, process: "dnsmasq", pid: 412 });
  }
  return [...device.sockets, ...extra];
}

// Removing an address takes away the routes whose gateway is no longer on a
// connected block, as the kernel does.
export function dropOrphanRoutes(device: DeviceState) {
  device.routes = device.routes.filter((r) => r.via === undefined || onLinkIface(device, r.via)?.name === r.dev);
}
