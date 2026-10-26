// What a router running dnsmasq does with the two questions it is asked:
// "who has this name?" (DNS) and "I need an address" (DHCP). Both read the
// device's dnsmasq state; the engine and the commands do the sending.

import type { DeviceState, Endpoint, World } from "./model";
import { broadcastDomain, ifaceOf } from "./model";
import { contains } from "./ip";

export type DnsStatus = "NOERROR" | "NXDOMAIN" | "REFUSED";

export interface DnsReply {
  status: DnsStatus;
  answer?: number;
}

export const normaliseName = (name: string) => name.trim().toLowerCase().replace(/\.$/, "");

// Does this device answer DNS on the address a query was sent to?
export function dnsServes(device: DeviceState, dst: number): boolean {
  const d = device.dnsmasq;
  if (!d?.running || !d.dns) return false;
  if (!d.dns.iface) return true;
  return ifaceOf(device, d.dns.iface)?.addrs.some((a) => a.addr === dst) ?? false;
}

export function dnsAnswer(device: DeviceState, name: string): DnsReply {
  const dns = device.dnsmasq?.dns;
  const answer = dns?.records[normaliseName(name)];
  if (answer !== undefined) return { status: "NOERROR", answer };
  return { status: dns?.unknown === "refused" ? "REFUSED" : "NXDOMAIN" };
}

export interface DhcpOffer {
  server: DeviceState;
  serverAddr: number;
  ip: number;
  prefix: number;
  router: number;
  dns: number;
  lease: number;
}

const hashMac = (mac: string) => [...mac].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

// A broadcast discover from `ep`: the first dnsmasq on the same link with a
// pool that has a free address answers with an offer. dnsmasq starts looking
// at a place in the pool taken from the client's MAC and walks forward, so the
// same MAC gets the same address again and different devices spread out.
export function dhcpDiscover(world: World, ep: Endpoint, mac: string): DhcpOffer | null {
  for (const peer of broadcastDomain(world, ep)) {
    const server = world.devices[peer.dev];
    const d = server.dnsmasq;
    const iface = ifaceOf(server, peer.iface);
    if (!d?.running || !d.dhcp || d.dhcp.iface !== peer.iface || !iface?.up || iface.addrs.length === 0) continue;
    const own = iface.addrs[0];
    const { start, end } = d.dhcp;
    if (end < start) continue;
    const size = end - start + 1;
    const inUse = (candidate: number) =>
      Object.values(world.devices).some((dev) => dev.ifaces.some((i) => i.addrs.some((a) => a.addr === candidate))) ||
      d.dhcp!.leases.some((l) => l.ip === candidate && l.mac !== mac);
    const held = d.dhcp.leases.find((l) => l.mac === mac);
    let ip: number | null = null;
    if (held && held.ip >= start && held.ip <= end) ip = held.ip;
    else {
      const first = hashMac(mac) % size;
      for (let n = 0; n < size; n += 1) {
        const candidate = start + ((first + n) % size);
        if (!inUse(candidate) && contains({ addr: own.addr, prefix: own.prefix }, candidate)) {
          ip = candidate;
          break;
        }
      }
    }
    if (ip === null) continue;
    d.dhcp.leases = d.dhcp.leases.filter((l) => l.mac !== mac);
    d.dhcp.leases.push({ mac, ip });
    return {
      server,
      serverAddr: own.addr,
      ip,
      prefix: own.prefix,
      router: d.dhcp.router ?? own.addr,
      dns: d.dhcp.dns ?? own.addr,
      lease: d.dhcp.lease,
    };
  }
  return null;
}

