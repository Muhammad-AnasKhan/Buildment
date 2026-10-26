// IPv4 address helpers for the network lab. Addresses are held as unsigned
// 32-bit numbers so prefix checks are plain bit masks.

export interface Cidr {
  addr: number;
  prefix: number;
}

export function parseIp(text: string): number | null {
  const parts = text.trim().split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const n = Number(part);
    if (n > 255) return null;
    value = value * 256 + n;
  }
  return value >>> 0;
}

export function formatIp(value: number): string {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join(".");
}

export function maskOf(prefix: number): number {
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}

// "192.168.1.23/24" (a host address with its prefix) or "10.0.0.0/8".
export function parseCidr(text: string): Cidr | null {
  const [ip, len, ...rest] = text.trim().split("/");
  if (rest.length > 0 || len === undefined || !/^\d{1,2}$/.test(len)) return null;
  const addr = parseIp(ip);
  const prefix = Number(len);
  if (addr === null || prefix > 32) return null;
  return { addr, prefix };
}

export function networkOf(c: Cidr): number {
  return (c.addr & maskOf(c.prefix)) >>> 0;
}

export function broadcastOf(c: Cidr): number {
  return (networkOf(c) | (~maskOf(c.prefix) >>> 0)) >>> 0;
}

export function contains(c: Cidr, ip: number): boolean {
  return ((ip & maskOf(c.prefix)) >>> 0) === networkOf(c);
}

export function formatCidr(c: Cidr): string {
  return `${formatIp(c.addr)}/${c.prefix}`;
}

export function formatNetwork(c: Cidr): string {
  return `${formatIp(networkOf(c))}/${c.prefix}`;
}

export function overlaps(a: Cidr, b: Cidr): boolean {
  const p = Math.min(a.prefix, b.prefix);
  return ((a.addr & maskOf(p)) >>> 0) === ((b.addr & maskOf(p)) >>> 0);
}

// Usable host addresses in a block (a /31 and /32 are special cases the course
// does not use, so they count as zero here).
export function usableHosts(prefix: number): number {
  return prefix >= 31 ? 0 : 2 ** (32 - prefix) - 2;
}

const RANGES = (list: string[]) => list.map((t) => parseCidr(t) as Cidr);
const PRIVATE = RANGES(["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"]);
const LOOPBACK = RANGES(["127.0.0.0/8"]);
const SHARED = RANGES(["100.64.0.0/10"]);
const DOCUMENTATION = RANGES(["192.0.2.0/24", "198.51.100.0/24", "203.0.113.0/24"]);

const inAny = (ranges: Cidr[], ip: number) => ranges.some((r) => contains(r, ip));

export const isPrivate = (ip: number) => inAny(PRIVATE, ip);
export const isLoopback = (ip: number) => inAny(LOOPBACK, ip);
export const isDocumentation = (ip: number) => inAny(DOCUMENTATION, ip);

// A lab may only use private, loopback, shared (provider NAT) or documentation
// addresses, so no lab ever shows a real public address.
export function isLabSafe(ip: number): boolean {
  return isPrivate(ip) || isLoopback(ip) || isDocumentation(ip) || inAny(SHARED, ip) || ip === 0;
}
