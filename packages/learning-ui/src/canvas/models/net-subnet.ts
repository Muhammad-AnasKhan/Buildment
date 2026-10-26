// The subnet model behind the module 3 modes of the address renderer:
// `mask-and` (the mask, the AND, the broadcast, a wide mask, a drill),
// `split` (sizes, places and boundaries) and `overlap` (ranges on one line,
// blocks that nest). Pure: no React, no clock, no unseeded randomness. It is
// also the reference for the exercises on network, broadcast, contains and
// splitting, so the canvas and the graded tests cannot disagree.
//
// Rules in one place:
//   - network = address AND mask; the last address is the network with every
//     host bit set to 1. Hosts lie between them (broadcast not included).
//   - /31 has two addresses and no directed broadcast (RFC 3021, [S70]);
//     /32 is one address; /0 is everything.
//   - A block of 2^k addresses starts where its last k bits are all zero.
//   - Two valid CIDR blocks either contain one another or share nothing.

import { z } from "zod";
import {
  ADDRESS_BITS,
  BYTE_BITS,
  blockSize,
  byteToBits,
  cidrRange,
  formatAddressNumber,
  ipToNumber,
  maskNumber,
  numberToIp,
  numberToParts,
  parseIpv4,
  usableCount,
  type Bits,
} from "./net-address";
import { between, drillRandom, shuffleWith, withOptions, type DrillItem } from "./net-drill";

const ipv4String = z.string().refine((s) => parseIpv4(s).ok, { message: "not a dotted IPv4 address" });
const toNumber = (ip: string | number) => (typeof ip === "number" ? ip : ipToNumber(ip));
const top = (n: number) => n >>> 0;

// ---------------------------------------------------------------- CIDR strings

/** Split "172.17.0.0/16" into its parts, or null when it is not a CIDR string. */
export function parseCidr(cidr: string): { address: number; prefix: number } | null {
  const m = /^([^/]+)\/(\d{1,2})$/.exec(cidr);
  if (!m) return null;
  const parsed = parseIpv4(m[1]);
  const prefix = Number(m[2]);
  if (!parsed.ok || prefix > ADDRESS_BITS) return null;
  return { address: parsed.number, prefix };
}

/** A block as a range of address numbers. */
export type BlockRange = { cidr: string; start: number; end: number; prefix: number; size: number };

/** The range of a CIDR string whose host bits are all zero. Throws when it is not such a string. */
export function rangeOf(cidr: string): BlockRange {
  const parsed = parseCidr(cidr);
  if (!parsed) throw new RangeError("A block is written like 172.17.0.0/16");
  const { start, end, prefix } = cidrRange(cidr);
  if (start !== parsed.address) throw new RangeError(`${cidr} has host bits set: a block starts where its host bits are zero`);
  return { cidr, start, end, prefix, size: blockSize(prefix) };
}

/** The block of `prefix` that starts at `start` as a CIDR string. */
export function cidrAt(start: number, prefix: number): string {
  return `${numberToIp(start)}/${prefix}`;
}

/** True for a CIDR string whose address is the first address of its block. */
export function isAlignedCidr(cidr: string): boolean {
  try {
    rangeOf(cidr);
    return true;
  } catch {
    return false;
  }
}

const alignedCidr = z.string().refine(isAlignedCidr, { message: "not a block that starts where its host bits are zero" });

// ---------------------------------------------------------------- the mask and the AND

export type SubnetFacts = {
  address: string;
  prefix: number;
  /** The mask in dotted form. */
  mask: string;
  network: string;
  networkNumber: number;
  /** The last address of the block (every host bit 1). */
  last: string;
  lastNumber: number;
  /** The directed broadcast: the last address, none on a /31 [S70], and the address itself on a /32. */
  broadcast: string | null;
  size: number;
  /** Addresses a host can use: size minus 2 up to /30, both on a /31, one on a /32. */
  hostCount: number;
  firstHost: string;
  lastHost: string;
  networkBits: number;
  hostBits: number;
  /** One line about the edge cases, or an empty string for an ordinary prefix. */
  edge: string;
};

/** Network, broadcast, host range and counts for one address and prefix. */
export function subnetFacts(address: string | number, prefix: number): SubnetFacts {
  const n = toNumber(address);
  const mask = maskNumber(prefix);
  const networkNumber = top(n & mask);
  const lastNumber = top(networkNumber | top(~mask));
  const size = blockSize(prefix);
  let broadcast: number | null = lastNumber;
  let firstHost = networkNumber + 1;
  let lastHost = lastNumber - 1;
  let edge = "";
  if (prefix === 32) {
    firstHost = networkNumber;
    lastHost = networkNumber;
    edge = "A /32 is one address: the network, the broadcast and the host are the same.";
  } else if (prefix === 31) {
    broadcast = null;
    firstHost = networkNumber;
    lastHost = lastNumber;
    edge = "A /31 has two addresses and no directed broadcast: both are hosts on a point-to-point link (RFC 3021).";
  } else if (prefix === 0) {
    edge = "A /0 is every address.";
  }
  return {
    address: numberToIp(n),
    prefix,
    mask: numberToIp(mask),
    network: numberToIp(networkNumber),
    networkNumber,
    last: numberToIp(lastNumber),
    lastNumber,
    broadcast: prefix === 32 ? numberToIp(networkNumber) : broadcast === null ? null : numberToIp(broadcast),
    size,
    hostCount: usableCount(prefix),
    firstHost: numberToIp(firstHost),
    lastHost: numberToIp(lastHost),
    networkBits: prefix,
    hostBits: ADDRESS_BITS - prefix,
    edge,
  };
}

/** Bit by bit AND of two equal-length bit lists. */
export function andBits(a: Bits, b: Bits): Bits {
  if (a.length !== b.length) throw new RangeError("Both bit lists need the same length");
  return a.map((bit, i) => (bit === 1 && b[i] === 1 ? 1 : 0)) as unknown as Bits;
}

/** The mask byte `k` (0 to 3) of a /prefix: 255 up to the cut, a partial byte at the cut, then 0. */
export function maskByteAt(prefix: number, k: number): number {
  return numberToParts(maskNumber(prefix))[k];
}

/** The byte where a prefix cuts or last reaches: the one worth showing in bits. A /23 and a /20 both cut the third byte. */
export function cutByteIndex(prefix: number): 0 | 1 | 2 | 3 {
  return Math.min(3, Math.max(0, Math.floor((prefix - 1) / BYTE_BITS))) as 0 | 1 | 2 | 3;
}

/** The first three numbers of two addresses are equal: the shortcut that only works for a /24. */
export function sameFirstThree(a: string | number, b: string | number): boolean {
  const x = numberToParts(toNumber(a));
  const y = numberToParts(toNumber(b));
  return x[0] === y[0] && x[1] === y[1] && x[2] === y[2];
}

/** True when two addresses give the same network under a /prefix: the test a host makes before it sends. */
export function sameSubnet(a: string | number, b: string | number, prefix: number): boolean {
  const mask = maskNumber(prefix);
  return top(toNumber(a) & mask) === top(toNumber(b) & mask);
}

export type LocalCheck = {
  /** Same network under the prefix, so the destination is local. */
  local: boolean;
  /** What the "first three numbers" shortcut would say. */
  shortcutLocal: boolean;
  /** The shortcut gives the wrong answer for this prefix and destination. */
  shortcutWrong: boolean;
  /** The byte shown in bits. */
  cutByte: 0 | 1 | 2 | 3;
  mine: number;
  theirs: number;
  maskByte: number;
  mineAnd: number;
  theirsAnd: number;
  /** The first network byte before the cut that already differs, or null. */
  differsAt: number | null;
  network: string;
  last: string;
};

/** Everything the wide-mask picture shows for one address, one prefix and one destination. */
export function localCheck(address: string, prefix: number, destination: string): LocalCheck {
  const facts = subnetFacts(address, prefix);
  const a = numberToParts(ipToNumber(address));
  const d = numberToParts(ipToNumber(destination));
  const cutByte = cutByteIndex(prefix);
  const maskByte = maskByteAt(prefix, cutByte);
  const local = sameSubnet(address, destination, prefix);
  const shortcutLocal = sameFirstThree(address, destination);
  let differsAt: number | null = null;
  for (let k = 0; k < cutByte; k += 1) {
    if (a[k] !== d[k]) {
      differsAt = k;
      break;
    }
  }
  return {
    local,
    shortcutLocal,
    shortcutWrong: shortcutLocal !== local,
    cutByte,
    mine: a[cutByte],
    theirs: d[cutByte],
    maskByte,
    mineAnd: a[cutByte] & maskByte,
    theirsAnd: d[cutByte] & maskByte,
    differsAt,
    network: facts.network,
    last: facts.last,
  };
}

const byteBits = (value: number) => byteToBits(value).join("");

/** The AND of one byte (the cut byte by default) in words and bits: "143 AND 240: 10001111 AND 11110000 = 10000000 = 128". */
export function andWorking(address: string | number, prefix: number, byte: number = cutByteIndex(prefix)): string {
  const k = byte;
  const a = numberToParts(toNumber(address))[k];
  const m = maskByteAt(prefix, k);
  const r = a & m;
  return `${a} AND ${m}: ${byteBits(a)} AND ${byteBits(m)} = ${byteBits(r)} = ${r}`;
}

/** Host bits per address-bit index for a prefix: true where the bit is part of the host. */
export function isHostBit(prefix: number, index: number): boolean {
  return index >= prefix;
}

/** The address number with its host part replaced by `hostValue` (the low `32 - prefix` bits). */
export function withHostPart(network: number, prefix: number, hostValue: number): number {
  const hostBits = ADDRESS_BITS - prefix;
  const limit = 2 ** hostBits;
  const v = Math.min(limit - 1, Math.max(0, Math.trunc(hostValue)));
  return top(network + v);
}

/** The host part of an address as a number (the low `32 - prefix` bits). */
export function hostPartOf(address: string | number, prefix: number): number {
  return top(toNumber(address) & top(~maskNumber(prefix)));
}

/** What an address is in its block: the network address, the last address, or a host. */
export function roleInBlock(address: string | number, prefix: number): "network" | "broadcast" | "host" {
  const f = subnetFacts(address, prefix);
  const n = toNumber(address);
  if (prefix >= 31) return "host";
  if (n === f.networkNumber) return "network";
  if (n === f.lastNumber) return "broadcast";
  return "host";
}

export const MASK_VIEWS = ["bits", "and", "broadcast", "wide", "drill"] as const;
export type MaskView = (typeof MASK_VIEWS)[number];

export const maskConfigSchema = z
  .object({
    mode: z.literal("mask-and"),
    view: z.enum(MASK_VIEWS),
    address: ipv4String.optional(),
    prefix: z.number().int().min(0).max(32).optional(),
    /** The prefix slider's bounds, for the `bits` view. */
    min: z.number().int().min(0).max(32).optional(),
    max: z.number().int().min(0).max(32).optional(),
    /** The destination the learner starts with, for the `wide` view. */
    destination: ipv4String.optional(),
  })
  .refine((c) => c.view === "drill" || (c.address !== undefined && c.prefix !== undefined), { message: "address and prefix are needed" })
  .refine((c) => c.view !== "bits" || (c.min !== undefined && c.max !== undefined && c.min < c.max && (c.prefix ?? -1) >= c.min && (c.prefix ?? 99) <= c.max), { message: "bits needs min < max with prefix between" })
  .refine((c) => c.view !== "wide" || c.destination !== undefined, { message: "wide needs a destination" });
export type MaskConfig = z.infer<typeof maskConfigSchema>;

// ---------------------------------------------------------------- the mask drill

/** Prefixes the drill uses: none is a multiple of 8, so the first-three-numbers shortcut fails for most. */
export const MASK_DRILL_PREFIXES = [17, 18, 19, 20, 21, 22, 23, 25, 26, 27, 28, 29, 30] as const;
const MASK_KINDS = ["network", "broadcast", "network", "broadcast", "same-subnet"] as const;

function randomAddress(rand: () => number): number {
  const family = between(rand, 0, 2);
  const c = between(rand, 0, 255);
  const d = between(rand, 1, 254);
  const parts = family === 0 ? [10, between(rand, 0, 255), c, d] : family === 1 ? [172, between(rand, 16, 31), c, d] : [192, 168, c, d];
  return ipToNumber(parts);
}

/**
 * Five questions for a set, the same every time for the same set number:
 * network twice, broadcast twice and same-subnet once, in a seeded order. One
 * question per set uses a /20 or a /23, where "keep the first three numbers"
 * fails. The first wrong option is that shortcut whenever it differs from the
 * answer; the other is a neighbouring block.
 */
export function generateMaskDrill(setNumber: number): DrillItem[] {
  const rand = drillRandom(setNumber, 0x3c6ef372);
  const wide = rand() < 0.5 ? 20 : 23;
  const rest = shuffleWith(MASK_DRILL_PREFIXES.filter((p) => p !== wide), rand).slice(0, 4);
  const prefixes = shuffleWith([wide, ...rest], rand);
  const kinds = shuffleWith(MASK_KINDS, rand);
  return kinds.map((kind, i) => maskQuestion(kind, prefixes[i], rand));
}

function maskQuestion(kind: (typeof MASK_KINDS)[number], prefix: number, rand: () => number): DrillItem {
  const n = randomAddress(rand);
  const f = subnetFacts(n, prefix);
  const shortcutNetwork = numberToIp(top(n & 0xffffff00));
  const shortcutBroadcast = numberToIp(top(n | 0xff));
  const subject = `${f.address}/${prefix}`;
  if (kind === "network") {
    const wrong = [shortcutNetwork, ...shuffleWith([numberToIp(f.networkNumber + f.size), numberToIp(f.networkNumber - f.size), numberToIp(f.networkNumber + 1)], rand)];
    return withOptions(kind, "Network address of", subject, f.network, wrong, `${andWorking(n, prefix)}, so the network is ${f.network}`, rand);
  }
  if (kind === "broadcast") {
    const wrong = [
      shortcutBroadcast,
      ...shuffleWith([numberToIp(f.lastNumber + 1), numberToIp(f.lastNumber - 1), f.network], rand),
    ];
    return withOptions(kind, "Broadcast address of", subject, f.last, wrong, `${f.network} with its ${f.hostBits} host bits set to 1 is ${f.last}`, rand);
  }
  // same-subnet: half inside the block, half just outside it
  const inside = rand() < 0.5;
  let other: number;
  if (inside) {
    other = f.networkNumber + between(rand, 0, f.size - 1);
    if (other === n) other = f.networkNumber + ((other - f.networkNumber + 1) % f.size);
  } else {
    other = rand() < 0.5 ? f.lastNumber + between(rand, 1, 40) : f.networkNumber - between(rand, 1, 40);
  }
  const same = sameSubnet(n, other, prefix);
  const otherIp = numberToIp(other);
  const options = ["Yes, same network", "No, other network"];
  return {
    kind,
    prompt: `Same network as ${subject}?`,
    subject: otherIp,
    options,
    answer: same ? 0 : 1,
    explain: `${subject} covers ${f.network} to ${f.last}; ${otherIp} is ${same ? "inside" : "outside"} it`,
  };
}

// ---------------------------------------------------------------- splitting a block

/** The block the course cuts up: 192.168.10.0/24. */
export const DEFAULT_SPLIT_BLOCK = "192.168.10.0/24";

/** The smallest prefix whose usable count holds `hosts`. Ordinary subnets stop at /30: a /31 is for a point-to-point link. */
export function hostsPrefix(hosts: number): number {
  if (!Number.isInteger(hosts) || hosts < 1) throw new RangeError("A network needs at least one host");
  for (let p = 30; p >= 1; p -= 1) {
    if (usableCount(p) >= hosts) return p;
  }
  throw new RangeError("No IPv4 block holds that many hosts");
}

/** True when `start` is the first address of some block of `prefix`: its host bits are all zero. */
export function startIsAligned(start: number, prefix: number): boolean {
  return start % blockSize(prefix) === 0;
}

/** Every start a block of `prefix` can have inside `parent`, in order. */
export function alignedStarts(parentCidr: string, prefix: number): number[] {
  const parent = rangeOf(parentCidr);
  if (prefix < parent.prefix) return [];
  const size = blockSize(prefix);
  const starts: number[] = [];
  for (let s = parent.start; s <= parent.end; s += size) starts.push(s);
  return starts;
}

/** The low `32 - prefix` bits of a start, as the bits a learner would read: "100100". */
export function hostBitsText(start: number, prefix: number): string {
  const hostBits = ADDRESS_BITS - prefix;
  const value = start % 2 ** hostBits;
  return value.toString(2).padStart(hostBits, "0");
}

/** ".100" inside a /24 or smaller parent, the dotted form otherwise. */
export function startLabel(parentCidr: string, start: number): string {
  const parent = rangeOf(parentCidr);
  return parent.prefix >= 24 ? `.${start % 256}` : numberToIp(start);
}

export type SplitNeed = { name: string; hosts: number };
export type Taken = { name: string; start: number; prefix: number };

export type SplitPlacement = {
  name: string;
  hosts: number;
  prefix: number;
  start: number;
  end: number;
  cidr: string;
  size: number;
  usable: number;
  /** Usable addresses the need leaves unused. */
  spare: number;
};

export type FreeBlock = { start: number; end: number; prefix: number; size: number; cidr: string };

/** Cut a run of addresses into the fewest aligned blocks, biggest first at each step. */
export function decompose(start: number, end: number): FreeBlock[] {
  const out: FreeBlock[] = [];
  let s = start;
  while (s <= end) {
    let size = s === 0 ? 2 ** 32 : top(s & -s);
    while (s + size - 1 > end) size /= 2;
    const prefix = ADDRESS_BITS - Math.log2(size);
    out.push({ start: s, end: s + size - 1, prefix, size, cidr: cidrAt(s, prefix) });
    s += size;
  }
  return out;
}

/** The space of `parent` not covered by `used`, as aligned blocks in address order. */
export function freeBlocks(parentCidr: string, used: readonly { start: number; end: number }[]): FreeBlock[] {
  const parent = rangeOf(parentCidr);
  const sorted = [...used].sort((a, b) => a.start - b.start);
  const out: FreeBlock[] = [];
  let cursor = parent.start;
  for (const u of sorted) {
    if (u.start > cursor) out.push(...decompose(cursor, u.start - 1));
    cursor = Math.max(cursor, u.end + 1);
  }
  if (cursor <= parent.end) out.push(...decompose(cursor, parent.end));
  return out;
}

const placementOf = (need: SplitNeed, prefix: number, start: number): SplitPlacement => {
  const size = blockSize(prefix);
  return {
    name: need.name,
    hosts: need.hosts,
    prefix,
    start,
    end: start + size - 1,
    cidr: cidrAt(start, prefix),
    size,
    usable: usableCount(prefix),
    spare: usableCount(prefix) - need.hosts,
  };
};

export type SplitPlan = { placements: SplitPlacement[]; free: FreeBlock[]; unplaced: SplitNeed[]; fits: boolean };

/** Largest need first, each into the next aligned free spot: the worked example of 3.5. */
export function planSplit(parentCidr: string, needs: readonly SplitNeed[]): SplitPlan {
  const parent = rangeOf(parentCidr);
  const sorted = needs.map((n, i) => ({ n, i })).sort((a, b) => b.n.hosts - a.n.hosts || a.i - b.i).map((x) => x.n);
  const placements: SplitPlacement[] = [];
  const unplaced: SplitNeed[] = [];
  let cursor = parent.start;
  for (const need of sorted) {
    const prefix = hostsPrefix(need.hosts);
    const size = blockSize(prefix);
    const start = Math.ceil(cursor / size) * size;
    if (prefix < parent.prefix || start + size - 1 > parent.end) {
      unplaced.push(need);
      continue;
    }
    placements.push(placementOf(need, prefix, start));
    cursor = start + size;
  }
  return { placements, free: freeBlocks(parentCidr, placements), unplaced, fits: unplaced.length === 0 };
}

/** The lowest aligned start for a block of `prefix` that touches nothing in `taken`, or null when there is no room. */
export function firstFit(parentCidr: string, taken: readonly { start: number; prefix: number }[], prefix: number): number | null {
  const size = blockSize(prefix);
  for (const start of alignedStarts(parentCidr, prefix)) {
    const end = start + size - 1;
    if (!taken.some((t) => start <= t.start + blockSize(t.prefix) - 1 && t.start <= end)) return start;
  }
  return null;
}

export type OrderResult = {
  placements: SplitPlacement[];
  /** The index (into `needs`) that did not fit, or null. */
  refused: number | null;
  free: FreeBlock[];
  /** Free blocks that lie before the end of the last placed block: space nothing else can reach in order. */
  holes: FreeBlock[];
};

/** Place the needs one after another in the given order, each at the first aligned free spot. */
export function placeInOrder(parentCidr: string, needs: readonly SplitNeed[], order: readonly number[]): OrderResult {
  const placements: SplitPlacement[] = [];
  let refused: number | null = null;
  for (const index of order) {
    const need = needs[index];
    if (!need) continue;
    const prefix = hostsPrefix(need.hosts);
    const start = firstFit(parentCidr, placements, prefix);
    if (start === null) {
      refused = index;
      continue;
    }
    placements.push(placementOf(need, prefix, start));
  }
  const free = freeBlocks(parentCidr, placements);
  const lastEnd = placements.reduce((m, p) => Math.max(m, p.end), -1);
  return { placements, refused, free, holes: free.filter((f) => f.end < lastEnd) };
}

/** The 3.5 boundary beat: the largest need is already placed, the next one is the block the learner moves. */
export function boundaryScenario(block: string, needs: readonly SplitNeed[]): { taken: Taken; moving: { name: string; hosts: number; prefix: number } } {
  const plan = planSplit(block, needs);
  const [first, second] = plan.placements;
  if (!first || !second) throw new RangeError("The boundary beat needs two placed networks");
  return { taken: { name: first.name, start: first.start, prefix: first.prefix }, moving: { name: second.name, hosts: second.hosts, prefix: second.prefix } };
}

/** ".0, .64, .128 or .192" */
function startsPhrase(labels: readonly string[]): string {
  return labels.length > 1 ? `${labels.slice(0, -1).join(", ")} or ${labels[labels.length - 1]}` : (labels[0] ?? "");
}

export type PlacementCheck = {
  ok: boolean;
  reasons: ("outside" | "unaligned" | "overlap")[];
  /** The first reason in words, or the all-clear. */
  message: string;
  /** Every reason in words. */
  lines: string[];
};

/** Try to drop a block of `prefix` at `start` into `parent`, beside what is already `taken`. */
export function checkPlacement(parentCidr: string, taken: readonly Taken[], prefix: number, start: number): PlacementCheck {
  const parent = rangeOf(parentCidr);
  const size = blockSize(prefix);
  const end = start + size - 1;
  const reasons: PlacementCheck["reasons"] = [];
  const lines: string[] = [];
  const label = (s: number) => startLabel(parentCidr, s);
  if (start < parent.start || end > parent.end) {
    reasons.push("outside");
    lines.push(`${cidrAt(start, prefix)} runs outside ${parentCidr}.`);
  }
  if (!startIsAligned(start, prefix)) {
    reasons.push("unaligned");
    const starts = alignedStarts(parentCidr, prefix);
    const list = starts.length > 0 && starts.length <= 8 ? starts.map(label) : [];
    const where = list.length > 0 ? `only at ${startsPhrase(list)}` : `only at a multiple of ${size}`;
    const bits = ADDRESS_BITS - prefix <= 12 ? ` Its last ${ADDRESS_BITS - prefix} bits are ${hostBitsText(start, prefix)}, not all zero.` : "";
    lines.push(`A /${prefix} holds ${size} addresses, so it can start ${where}. ${label(start)} is not one of them.${bits}`);
  }
  for (const t of taken) {
    const tEnd = t.start + blockSize(t.prefix) - 1;
    if (start <= tEnd && t.start <= end) {
      reasons.push("overlap");
      lines.push(`It would overlap ${t.name} (${label(t.start)} to ${label(tEnd)}).`);
      break;
    }
  }
  return { ok: reasons.length === 0, reasons, message: lines[0] ?? "It starts on a boundary and the space is free.", lines };
}

export const SPLIT_VIEWS = ["size", "place", "boundary", "drill"] as const;
export type SplitView = (typeof SPLIT_VIEWS)[number];

export const splitConfigSchema = z
  .object({
    mode: z.literal("split"),
    view: z.enum(SPLIT_VIEWS),
    block: alignedCidr,
    needs: z.array(z.object({ name: z.string().min(1).max(16), hosts: z.number().int().positive() })).min(1).max(5),
    /** The prefixes offered, for the `size` view. */
    choices: z.array(z.number().int().min(1).max(30)).min(2).max(8).optional(),
    /** Where the moving block starts in the `boundary` view, as a number of addresses after the start of the block. */
    startOffset: z.number().int().min(0).optional(),
  })
  .refine((c) => c.view !== "size" || (c.choices !== undefined && new Set(c.choices).size === c.choices.length), { message: "size needs distinct choices" })
  .refine((c) => c.view !== "boundary" || c.needs.length >= 2, { message: "boundary needs two needs: one already placed, one to move" })
  .refine(
    (c) => {
      if (c.view === "drill") return true;
      try {
        return planSplit(c.block, c.needs).fits;
      } catch {
        return false;
      }
    },
    { message: "the needs do not fit the block" },
  );
export type SplitConfig = z.infer<typeof splitConfigSchema>;

const SPLIT_KINDS = ["size", "start", "size", "start", "next"] as const;

/**
 * Five questions for a set, the same every time for the same set number: the
 * smallest prefix for a host count (twice), a start a block may have (twice)
 * and where the next block goes after one is placed. Wrong options are the
 * realistic slips: one prefix off, half a block off, inside the placed block.
 */
export function generateSplitDrill(setNumber: number, block: string = DEFAULT_SPLIT_BLOCK): DrillItem[] {
  const rand = drillRandom(setNumber, 0x1b873593);
  const parent = rangeOf(block);
  const kinds = shuffleWith(SPLIT_KINDS, rand);
  const usedPrefix = new Set<number>();
  const pickPrefix = (low: number, high: number) => {
    for (let tries = 0; tries < 20; tries += 1) {
      const p = between(rand, low, high);
      if (!usedPrefix.has(p) || tries === 19) {
        usedPrefix.add(p);
        return p;
      }
    }
    return low;
  };
  return kinds.map((kind): DrillItem => {
    if (kind === "size") {
      const p = pickPrefix(parent.prefix + 1, 29);
      const tight = rand() < 0.5;
      const hosts = tight ? usableCount(p) : usableCount(p) + 1;
      const answer = hostsPrefix(hosts);
      const wrong = [answer - 1, answer + 1 <= 30 ? answer + 1 : answer - 2].filter((x) => x >= 1).map((x) => `/${x}`);
      const note = answer + 1 <= 30 ? `; /${answer + 1} holds only ${usableCount(answer + 1)}` : "";
      return withOptions(kind, "Smallest prefix that holds", `${hosts} hosts`, `/${answer}`, wrong, `/${answer} holds ${usableCount(answer)}${note}`, rand);
    }
    if (kind === "start") {
      const p = pickPrefix(25, 28);
      const size = blockSize(p);
      const starts = alignedStarts(block, p);
      const valid = starts[between(rand, 0, starts.length - 1)];
      const half = valid + size / 2;
      let off = valid + between(rand, 1, size - 1);
      for (let tries = 0; (off === half || off === valid) && tries < 20; tries += 1) off = valid + between(rand, 1, size - 1);
      const phrase = starts.length <= 4 ? `only at ${startsPhrase(starts.map((x) => startLabel(block, x)))}` : `at a multiple of ${size}`;
      return withOptions(kind, `Which address may a /${p} start at inside ${block}?`, `/${p}`, numberToIp(valid), [numberToIp(half), numberToIp(off)], `A /${p} holds ${size} addresses, so it starts ${phrase}`, rand);
    }
    // next: after a first block is placed at the start, where may the next one begin?
    const first = pickPrefix(parent.prefix + 1, parent.prefix + 2);
    const second = between(rand, first + 1, Math.min(first + 2, 29));
    const start = firstFit(block, [{ start: parent.start, prefix: first }], second) as number;
    const inside = parent.start + blockSize(second);
    const half = start + blockSize(second) / 2;
    return withOptions(
      kind,
      `A /${first} is placed at ${startLabel(block, parent.start)}. Where does a /${second} go next?`,
      `/${second}`,
      numberToIp(start),
      [numberToIp(inside), numberToIp(half)],
      `The /${first} takes ${startLabel(block, parent.start)} to ${startLabel(block, parent.start + blockSize(first) - 1)}, so the next free multiple of ${blockSize(second)} is ${startLabel(block, start)}`,
      rand,
    );
  });
}

// ---------------------------------------------------------------- overlaps

export type Relation = "same" | "contains" | "inside" | "apart";

export type BlockRelation = {
  /** `a` against `b`: the same block, `a` holds `b`, `a` sits inside `b`, or nothing in common. */
  kind: Relation;
  /** The addresses both blocks hold, or null when they share none. */
  overlap: { start: number; end: number; size: number } | null;
  /** The blocks touch end to start without sharing an address. */
  adjacent: boolean;
};

/** How two blocks relate. Valid CIDR blocks are never partly overlapping. */
export function relate(a: BlockRange, b: BlockRange): BlockRelation {
  const start = Math.max(a.start, b.start);
  const end = Math.min(a.end, b.end);
  const overlap = start <= end ? { start, end, size: end - start + 1 } : null;
  const adjacent = a.end + 1 === b.start || b.end + 1 === a.start;
  let kind: Relation = "apart";
  if (overlap) {
    if (a.start === b.start && a.end === b.end) kind = "same";
    else if (a.start <= b.start && a.end >= b.end) kind = "contains";
    else kind = "inside";
  }
  return { kind, overlap, adjacent };
}

/** The sentence for a relation, with the blocks' names. */
export function relationText(a: { name: string; range: BlockRange }, b: { name: string; range: BlockRange }): string {
  const r = relate(a.range, b.range);
  const x = `${a.name} ${a.range.cidr}`;
  const y = `${b.name} ${b.range.cidr}`;
  if (r.kind === "same") return `${x} and ${y} are the same block.`;
  if (r.kind === "contains") return `${y} sits inside ${x}: every address of ${b.name} is also in ${a.name}.`;
  if (r.kind === "inside") return `${x} sits inside ${y}: every address of ${a.name} is also in ${b.name}.`;
  return r.adjacent ? `${x} and ${y} touch but share no address.` : `${x} and ${y} share no address.`;
}

export type BitCompare = {
  /** How many leading bits both blocks pin down: the shorter prefix. */
  shared: number;
  /** The first of those bits where the two addresses differ, or null when they all agree. */
  firstDiff: number | null;
  nested: boolean;
};

/** The bit view of "nest or stay apart": compare the first min(prefix) bits of both starts. */
export function compareBits(a: { start: number; prefix: number }, b: { start: number; prefix: number }): BitCompare {
  const shared = Math.min(a.prefix, b.prefix);
  for (let i = 0; i < shared; i += 1) {
    const bit = (n: number) => Math.floor(n / 2 ** (ADDRESS_BITS - 1 - i)) % 2;
    if (bit(a.start) !== bit(b.start)) return { shared, firstDiff: i, nested: false };
  }
  return { shared, firstDiff: null, nested: true };
}

export type Slots = { count: number; start: (index: number) => number };

/** The places a block of `prefix` can sit inside a window, side by side. */
export function windowSlots(windowCidr: string, prefix: number): Slots {
  const w = rangeOf(windowCidr);
  const size = blockSize(prefix);
  const count = Math.max(1, Math.floor(w.size / size));
  return { count, start: (index) => w.start + Math.min(count - 1, Math.max(0, Math.trunc(index))) * size };
}

/** The slot of a window that holds `start`, kept inside the window. */
export function slotOf(windowCidr: string, prefix: number, start: number): number {
  const w = rangeOf(windowCidr);
  const { count } = windowSlots(windowCidr, prefix);
  return Math.min(count - 1, Math.max(0, Math.floor((start - w.start) / blockSize(prefix))));
}

export const OVERLAP_VIEWS = ["line", "nest"] as const;
export type OverlapView = (typeof OVERLAP_VIEWS)[number];

export const overlapConfigSchema = z
  .object({
    mode: z.literal("overlap"),
    view: z.enum(OVERLAP_VIEWS),
    fixedName: z.string().min(1).max(14),
    fixed: alignedCidr,
    movingName: z.string().min(1).max(14),
    moving: alignedCidr,
    /** The stretch of addresses the moving block slides across. */
    window: alignedCidr,
    /** The prefixes the learner may give the moving block, for the `nest` view. */
    minPrefix: z.number().int().min(1).max(32).optional(),
    maxPrefix: z.number().int().min(1).max(32).optional(),
  })
  .refine(
    (c) => {
      try {
        const w = rangeOf(c.window);
        const m = rangeOf(c.moving);
        return m.start >= w.start && m.end <= w.end;
      } catch {
        return false;
      }
    },
    { message: "the moving block must lie inside the window" },
  )
  .refine(
    (c) => {
      if (c.view !== "nest") return true;
      try {
        return c.minPrefix !== undefined && c.maxPrefix !== undefined && c.minPrefix < c.maxPrefix && c.minPrefix >= rangeOf(c.window).prefix;
      } catch {
        return false;
      }
    },
    { message: "nest needs minPrefix < maxPrefix, not wider than the window" },
  );
export type OverlapConfig = z.infer<typeof overlapConfigSchema>;

/** The formatted pair "2,886,795,264 to 2,886,860,799" for a range. */
export function rangeNumbers(range: { start: number; end: number }): string {
  return `${formatAddressNumber(range.start)} to ${formatAddressNumber(range.end)}`;
}
