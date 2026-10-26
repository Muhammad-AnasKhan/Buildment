// The address model behind the net-m2 canvases (byte bits, address bits and
// the drill). Pure: no React, no clock, no unseeded randomness. It doubles as
// the reference for the code exercises on parsing and converting addresses, so
// the canvas and the graded tests cannot disagree.
//
// Rules in one place:
//   - A byte is eight bits worth 128, 64, 32, 16, 8, 4, 2, 1 (unsigned, 0 to 255).
//   - An IPv4 address is four bytes, or one unsigned 32-bit number (0 to 4,294,967,295).
//   - A typed address has exactly four parts, digits only, each 0 to 255,
//     and no leading zero unless the part is exactly "0".

import { z } from "zod";

export const BYTE_PLACES = [128, 64, 32, 16, 8, 4, 2, 1] as const;
export const BYTE_BITS = 8;
export const BYTE_MAX = 255;
export const ADDRESS_BITS = 32;
export const ADDRESS_MAX = 4_294_967_295;
export const DEFAULT_ADDRESS = "192.168.1.23";
export const DEFAULT_BYTE_BITS: Bits = [0, 0, 0, 1, 0, 1, 1, 1];
export const DRILL_SIZE = 5;

/** Eight (or 32) values of 0 or 1, most significant first. */
export type Bit = 0 | 1;
export type Bits = readonly Bit[];

// ---------------------------------------------------------------- bytes

/** The bits of a byte, most significant first. Out-of-range values are clamped. */
export function byteToBits(value: number): Bits {
  const v = clampByte(value);
  return BYTE_PLACES.map((place) => (v & place ? 1 : 0)) as Bit[];
}

/** The value of eight bits: the sum of the place values that are on. */
export function bitsToByte(bits: Bits): number {
  return BYTE_PLACES.reduce((sum, place, i) => sum + (bits[i] === 1 ? place : 0), 0);
}

function clampByte(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(BYTE_MAX, Math.max(0, Math.trunc(value)));
}

/** The place values that are on, biggest first: [16, 4, 2, 1]. */
export function placesOn(bits: Bits): number[] {
  return BYTE_PLACES.filter((_, i) => bits[i] === 1);
}

/** "16 + 4 + 2 + 1", or "0" when no bit is on. */
export function sumText(bits: Bits): string {
  const on = placesOn(bits);
  return on.length === 0 ? "0" : on.join(" + ");
}

/** "16 + 4 + 2 + 1 = 23". */
export function sumEquation(bits: Bits): string {
  return `${sumText(bits)} = ${bitsToByte(bits)}`;
}

/** A copy of the bits with one flipped. An index outside the byte changes nothing. */
export function toggleBit(bits: Bits, index: number): Bits {
  if (!Number.isInteger(index) || index < 0 || index >= bits.length) return bits;
  return bits.map((b, i) => (i === index ? (b === 1 ? 0 : 1) : b)) as Bit[];
}

export type ByteIncrement = {
  bits: Bits;
  value: number;
  /** True when the carry left the byte: 255 + 1 is 0 with a carry out of the top bit. */
  overflow: boolean;
};

/** Binary add-one with carry. At 255 every bit becomes 0 and the overflow flag is set. */
export function incrementByte(bits: Bits): ByteIncrement {
  const next = [...bits] as Bit[];
  let i = next.length - 1;
  while (i >= 0 && next[i] === 1) {
    next[i] = 0;
    i -= 1;
  }
  if (i < 0) return { bits: next, value: bitsToByte(next), overflow: true };
  next[i] = 1;
  return { bits: next, value: bitsToByte(next), overflow: false };
}

export type CarryStep = { index: number; bit: Bit };

/**
 * The carry as the canvas plays it: one bit changes per step, right to left.
 * Applying every step to the start gives exactly `incrementByte`. When
 * `overflow` is true the last step has been taken and the carry would enter a
 * ninth bit that does not exist.
 */
export function carrySteps(bits: Bits): { steps: CarryStep[]; overflow: boolean; result: Bits } {
  const steps: CarryStep[] = [];
  let i = bits.length - 1;
  while (i >= 0 && bits[i] === 1) {
    steps.push({ index: i, bit: 0 });
    i -= 1;
  }
  const overflow = i < 0;
  if (!overflow) steps.push({ index: i, bit: 1 });
  return { steps, overflow, result: incrementByte(bits).bits };
}

// ---------------------------------------------------------------- addresses

export type ParseError = { kind: "parts" | "range" | "leading-zero" | "digits"; message: string };
export type ParseResult =
  | { ok: true; parts: [number, number, number, number]; number: number }
  | { ok: false; error: ParseError };

export const ERROR_PARTS = "An address has four parts";
export const ERROR_LEADING_ZERO = "Leading zeros are not used in this course";
export const ERROR_DIGITS = "Each part is digits only";
export const rangeMessage = (part: string) => `${part.replace(/^0+(?=\d)/, "")} is more than one byte can hold`;

/**
 * Parse a dotted address. Strict on purpose, the same rules as the code
 * exercises: exactly four parts, digits only, each 0 to 255, no leading zero
 * unless the part is "0". Surrounding spaces are not trimmed here.
 */
export function parseIpv4(text: string): ParseResult {
  const fail = (kind: ParseError["kind"], message: string): ParseResult => ({ ok: false, error: { kind, message } });
  const raw = text.split(".");
  if (raw.length !== 4) return fail("parts", ERROR_PARTS);
  const parts: number[] = [];
  for (const piece of raw) {
    if (!/^\d+$/.test(piece)) return fail("digits", ERROR_DIGITS);
    if (piece.length > 1 && piece.startsWith("0")) return fail("leading-zero", ERROR_LEADING_ZERO);
    const value = Number(piece);
    if (value > BYTE_MAX) return fail("range", rangeMessage(piece));
    parts.push(value);
  }
  const tuple = parts as [number, number, number, number];
  return { ok: true, parts: tuple, number: partsToNumber(tuple) };
}

/** Four bytes to one unsigned number. `>>> 0` keeps the top bit from making it negative. */
export function partsToNumber(parts: readonly number[]): number {
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

/** A dotted string (or four bytes) to its single unsigned number. Throws on invalid input. */
export function ipToNumber(input: string | readonly number[]): number {
  if (typeof input === "string") {
    const parsed = parseIpv4(input);
    if (!parsed.ok) throw new RangeError(parsed.error.message);
    return parsed.number;
  }
  if (input.length !== 4 || input.some((p) => !Number.isInteger(p) || p < 0 || p > BYTE_MAX)) {
    throw new RangeError("An address is four whole numbers from 0 to 255");
  }
  return partsToNumber(input);
}

function assertAddressNumber(n: number): void {
  if (!Number.isInteger(n) || n < 0 || n > ADDRESS_MAX) {
    throw new RangeError("An address number is a whole number from 0 to 4,294,967,295");
  }
}

/** One unsigned number back to four bytes. */
export function numberToParts(n: number): [number, number, number, number] {
  assertAddressNumber(n);
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
}

/** One unsigned number back to dotted form. Throws outside 0 to 4,294,967,295. */
export function numberToIp(n: number): string {
  return numberToParts(n).join(".");
}

/** All 32 bits of an address number, most significant first. */
export function numberToBits(n: number): Bits {
  return numberToParts(n).flatMap((p) => [...byteToBits(p)]) as Bit[];
}

/** 32 bits back to the address number. */
export function bitsToNumber(bits: Bits): number {
  if (bits.length !== ADDRESS_BITS) throw new RangeError("An address is 32 bits");
  return partsToNumber([0, 1, 2, 3].map((k) => bitsToByte(bits.slice(k * 8, k * 8 + 8))));
}

/** Flip one of the 32 bits (0 is the top bit). Stays unsigned. An index outside 0 to 31 changes nothing. */
export function flipAddressBit(n: number, index: number): number {
  assertAddressNumber(n);
  if (!Number.isInteger(index) || index < 0 || index >= ADDRESS_BITS) return n;
  return (n ^ (1 << (ADDRESS_BITS - 1 - index))) >>> 0;
}

/** 3232235799 to "3,232,235,799", the same in every locale. */
export function formatAddressNumber(n: number): string {
  return String(Math.trunc(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ---------------------------------------------------------------- drill

export type ByteToBitsQuestion = { kind: "byte-to-bits"; value: number };
export type BitsToByteQuestion = {
  kind: "bits-to-byte";
  bits: Bits;
  value: number;
  /** Three numbers: the answer and two distractors, in display order. */
  options: [number, number, number];
};
export type RealOrNotQuestion = { kind: "real-or-not"; text: string; real: boolean };
export type DrillQuestion = ByteToBitsQuestion | BitsToByteQuestion | RealOrNotQuestion;
export type DrillAnswer = Bits | number | boolean;

/** The numbers 0 and 255 appear in one of every three sets, by set number. */
export function setHasEdge(setNumber: number): boolean {
  return ((Math.trunc(setNumber) % 3) + 3) % 3 === 1;
}

/** mulberry32: a small seeded random source. Same seed, same sequence. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The seed for a set: derived from the set number, so a mentor can reproduce a set. */
export function seedForSet(setNumber: number): number {
  return (Math.imul(Math.max(1, Math.trunc(setNumber) || 1), 2654435761) ^ 0x9e3779b9) >>> 0;
}

const KINDS: DrillQuestion["kind"][] = ["byte-to-bits", "bits-to-byte", "byte-to-bits", "bits-to-byte", "real-or-not"];

function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const digits = (n: number) => String(n).length;

/** Distractors for bits-to-byte: one bit misread, and the bits read right to left. */
function distractors(bits: Bits, value: number, rand: () => number): [number, number] {
  const reversed = bitsToByte([...bits].reverse() as Bit[]);
  const misread = shuffle(BYTE_PLACES, rand).map((place) => value ^ place);
  const pool: number[] = [];
  if (reversed !== value) pool.push(reversed);
  pool.push(...misread);
  // Same number of digits as the answer where possible, then the rest.
  const same = pool.filter((n) => digits(n) === digits(value));
  const rest = pool.filter((n) => digits(n) !== digits(value));
  const chosen: number[] = [];
  for (const n of [...same, ...rest]) {
    if (n !== value && !chosen.includes(n)) chosen.push(n);
    if (chosen.length === 2) break;
  }
  return [chosen[0], chosen[1]];
}

function realText(real: boolean, rand: () => number): string {
  const part = () => Math.floor(rand() * 256);
  const parts = [part(), part(), part(), part()];
  // Keep the strings recognisable: the first part of a real example is a common one.
  if (rand() < 0.5) parts[0] = [10, 172, 192, 8, 203][Math.floor(rand() * 5)];
  const strings = parts.map(String);
  if (!real) strings[Math.floor(rand() * 4)] = String(256 + Math.floor(rand() * 744));
  return strings.join(".");
}

/**
 * Five questions for a set, the same every time for the same set number.
 * Two byte-to-bits, two bits-to-byte and one real-or-not, in a seeded order.
 * No question repeats inside a set, and one in every three sets carries 0 or 255.
 */
export function generateDrill(setNumber: number): DrillQuestion[] {
  const rand = seededRandom(seedForSet(setNumber));
  const order = shuffle(KINDS, rand);
  const used = new Set<number>();
  let edgePending = setHasEdge(setNumber);
  const edgeValue = Math.floor(Math.max(1, Math.trunc(setNumber)) / 3) % 2 === 0 ? 0 : 255;

  const pickValue = (): number => {
    if (edgePending) {
      edgePending = false;
      used.add(edgeValue);
      return edgeValue;
    }
    for (;;) {
      const v = 1 + Math.floor(rand() * 254);
      if (!used.has(v)) {
        used.add(v);
        return v;
      }
    }
  };

  return order.map((kind): DrillQuestion => {
    if (kind === "byte-to-bits") return { kind, value: pickValue() };
    if (kind === "bits-to-byte") {
      const value = pickValue();
      const bits = byteToBits(value);
      const [a, b] = distractors(bits, value, rand);
      const options = shuffle([value, a, b], rand) as [number, number, number];
      return { kind, bits, value, options };
    }
    const real = rand() < 0.5;
    return { kind, text: realText(real, rand), real };
  });
}

/** True when the answer is right: the tapped bits, the picked number, or the real/not choice. */
export function checkAnswer(question: DrillQuestion, answer: DrillAnswer): boolean {
  switch (question.kind) {
    case "byte-to-bits":
      return Array.isArray(answer) && bitsToByte(answer as Bits) === question.value && answer.length === BYTE_BITS;
    case "bits-to-byte":
      return typeof answer === "number" && answer === question.value;
    case "real-or-not":
      return typeof answer === "boolean" && answer === question.real;
  }
}

/** The feedback after an answer, in words: the bits with their place values summed. */
export function explainQuestion(question: DrillQuestion): string {
  switch (question.kind) {
    case "byte-to-bits":
      return sumEquation(byteToBits(question.value));
    case "bits-to-byte":
      return sumEquation(question.bits);
    case "real-or-not": {
      const parsed = parseIpv4(question.text);
      if (parsed.ok) return "Four parts, each 0 to 255, so it can exist";
      // Short enough to fit the question card on a 375px phone.
      if (parsed.error.kind === "range") return `${parsed.error.message.split(" ")[0]} is above 255: it cannot exist`;
      return `${parsed.error.message}: it cannot exist`;
    }
  }
}

/** Eight bits as two groups of four, for reading: "1001 0110". */
export function groupedBits(bits: Bits): string {
  return `${bits.slice(0, 4).join("")} ${bits.slice(4).join("")}`;
}

export function scoreText(correct: number, total: number = DRILL_SIZE): string {
  return `${correct} of ${total} by hand`;
}

// ================================================================ module 2.1, 2.3, 2.4 modes
//
// Everything below serves the `allocate`, `prefix`, `classify` and CIDR drill
// modes of the address renderer. Each mode is fed by plain, serialisable
// parameters (numbers, strings, arrays), checked by a zod schema here, so the
// same parameters can later arrive from a Markdown `canvas` fence without new
// code. The functions are also the reference for the exercises on prefixes,
// sizes and `classify`, so the canvas and the graded tests cannot disagree.

const ipv4String = z.string().refine((s) => parseIpv4(s).ok, { message: "not a dotted IPv4 address" });

// ---------------------------------------------------------------- prefixes

export const PREFIX_MIN = 8;
export const PREFIX_MAX = 32;

function assertPrefix(prefix: number): void {
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > ADDRESS_BITS) {
    throw new RangeError("A prefix length is a whole number from 0 to 32");
  }
}

/** Addresses in a /n block: 2^(32-n). A /8 is 16,777,216 and a /32 is 1. */
export function blockSize(prefix: number): number {
  assertPrefix(prefix);
  return 2 ** (ADDRESS_BITS - prefix);
}

/**
 * Addresses a host can use in a /n block. Up to /30 the first address names the
 * network and the last is the broadcast, so usable is size minus two. A /31 is a
 * point-to-point link with both addresses usable (RFC 3021), and a /32 is one.
 */
export function usableCount(prefix: number): number {
  const size = blockSize(prefix);
  if (prefix >= 31) return size;
  return size - 2;
}

/** The mask of a /n as one unsigned number: n ones, then 32-n zeros. */
export function maskNumber(prefix: number): number {
  assertPrefix(prefix);
  return prefix === 0 ? 0 : (0xffffffff << (ADDRESS_BITS - prefix)) >>> 0;
}

export type PrefixFacts = {
  prefix: number;
  address: string;
  /** The mask in dotted form: 255.255.255.0 */
  mask: string;
  maskBits: Bits;
  addressBits: Bits;
  size: number;
  usable: number;
  /** First address of the block. */
  first: string;
  /** Last address of the block. */
  last: string;
  networkBits: number;
  hostBits: number;
};

/** Everything the prefix picture shows for one address and one prefix length. */
export function prefixFacts(address: string | number, prefix: number): PrefixFacts {
  assertPrefix(prefix);
  const n = typeof address === "number" ? address : ipToNumber(address);
  const mask = maskNumber(prefix);
  const network = (n & mask) >>> 0;
  const last = (network | (~mask >>> 0)) >>> 0;
  return {
    prefix,
    address: numberToIp(n),
    mask: numberToIp(mask),
    maskBits: numberToBits(mask),
    addressBits: numberToBits(n),
    size: blockSize(prefix),
    usable: usableCount(prefix),
    first: numberToIp(network),
    last: numberToIp(last),
    networkBits: prefix,
    hostBits: ADDRESS_BITS - prefix,
  };
}

/** The table behind the picture: one row per prefix from `min` to `max`. */
export function prefixTable(min = PREFIX_MIN, max = PREFIX_MAX): { prefix: number; size: number; usable: number; mask: string }[] {
  const rows: { prefix: number; size: number; usable: number; mask: string }[] = [];
  for (let p = min; p <= max; p += 1) rows.push({ prefix: p, size: blockSize(p), usable: usableCount(p), mask: numberToIp(maskNumber(p)) });
  return rows;
}

/** One line under the facts: the rule for ordinary blocks, the two edge cases in their own words. */
export function prefixNote(prefix: number): string {
  assertPrefix(prefix);
  if (prefix === 32) return "A /32 is one address: a single host";
  if (prefix === 31) return "A /31 has 2 addresses, both usable (point to point)";
  return "Usable is size minus 2: network and broadcast";
}

export const prefixConfigSchema = z
  .object({
    mode: z.literal("prefix"),
    address: ipv4String,
    min: z.number().int().min(0).max(32),
    max: z.number().int().min(0).max(32),
    initial: z.number().int().min(0).max(32),
  })
  .refine((c) => c.min < c.max && c.initial >= c.min && c.initial <= c.max, { message: "min < max and initial between them" });
export type PrefixConfig = z.infer<typeof prefixConfigSchema>;

// ---------------------------------------------------------------- allocation

export const allocateConfigSchema = z
  .object({
    mode: z.literal("allocate"),
    /** "class" offers whole classes only; "cidr" offers a prefix for each organisation. */
    flavour: z.enum(["class", "cidr"]),
    orgs: z.array(z.object({ name: z.string().min(1).max(14), need: z.number().int().positive() })).min(1).max(8),
    /** The blocks the learner can pick, as prefix lengths, with the label on the chip. */
    choices: z.array(z.object({ prefix: z.number().int().min(1).max(30), label: z.string().min(1).max(10) })).min(2).max(9),
  })
  .refine((c) => new Set(c.choices.map((x) => x.prefix)).size === c.choices.length, { message: "choices repeat a prefix" });
export type AllocateConfig = z.infer<typeof allocateConfigSchema>;
export type AllocatePicks = readonly (number | null)[];

const computers = (n: number) => `${formatAddressNumber(n)} computer${n === 1 ? "" : "s"}`;

/** The smallest block (largest prefix number) among the choices that holds `need` hosts, or null if none does. */
export function smallestFit(need: number, choices: readonly { prefix: number }[]): number | null {
  let best: number | null = null;
  for (const { prefix } of choices) {
    if (usableCount(prefix) >= need && (best === null || prefix > best)) best = prefix;
  }
  return best;
}

/** Addresses left over when `prefix` is given to an organisation needing `need`. Negative means it does not fit. */
export function unusedIn(need: number, prefix: number): number {
  return usableCount(prefix) - need;
}

export type PlaceResult = { picks: AllocatePicks; refused: boolean; message: string };

/** Give one organisation a block. A block too small is refused and nothing changes; a bigger one is allowed. */
export function placeBlock(config: AllocateConfig, picks: AllocatePicks, row: number, prefix: number): PlaceResult {
  const org = config.orgs[row];
  const choice = config.choices.find((c) => c.prefix === prefix);
  if (!org || !choice) return { picks, refused: false, message: "" };
  const usable = usableCount(prefix);
  if (org.need > usable) {
    return { picks, refused: true, message: `${computers(org.need)} ${org.need === 1 ? "does" : "do"} not fit in ${formatAddressNumber(usable)}` };
  }
  return {
    picks: picks.map((p, i) => (i === row ? prefix : p)),
    refused: false,
    message: `${org.name}: ${choice.label} holds ${formatAddressNumber(usable)}, ${formatAddressNumber(usable - org.need)} unused`,
  };
}

export type AllocationRow = { name: string; need: number; prefix: number | null; usable: number | null; unused: number | null };

export function allocationRows(config: AllocateConfig, picks: AllocatePicks): AllocationRow[] {
  return config.orgs.map((org, i) => {
    const prefix = picks[i] ?? null;
    return { name: org.name, need: org.need, prefix, usable: prefix === null ? null : usableCount(prefix), unused: prefix === null ? null : unusedIn(org.need, prefix) };
  });
}

export type AllocationTotals = {
  placed: number;
  total: number;
  /** One routing-table entry per block given out. */
  routes: number;
  unused: number;
  complete: boolean;
};

export function allocationTotals(config: AllocateConfig, picks: AllocatePicks): AllocationTotals {
  const rows = allocationRows(config, picks);
  const placed = rows.filter((r) => r.prefix !== null).length;
  return { placed, total: rows.length, routes: placed, unused: rows.reduce((sum, r) => sum + (r.unused ?? 0), 0), complete: placed === rows.length };
}

/** Total unused when every organisation gets the smallest block that fits, or null if one cannot be served. */
export function bestUnused(config: AllocateConfig): number | null {
  let total = 0;
  for (const org of config.orgs) {
    const prefix = smallestFit(org.need, config.choices);
    if (prefix === null) return null;
    total += unusedIn(org.need, prefix);
  }
  return total;
}

/** The sentence in the verdict banner (at most about 42 characters) and its tone. */
export function allocateVerdict(config: AllocateConfig, picks: AllocatePicks, refusal: string | null): { text: string; tone: "accent" | "good" | "warn" | "bad" } {
  if (refusal) return { text: refusal, tone: "bad" };
  const totals = allocationTotals(config, picks);
  if (totals.placed === 0) return { text: config.flavour === "class" ? "Give each organisation a class" : "Give each organisation a block", tone: "accent" };
  const unused = formatAddressNumber(totals.unused);
  if (!totals.complete) return { text: `${totals.placed} of ${totals.total} placed, ${unused} unused`, tone: "accent" };
  const best = bestUnused(config);
  if (best !== null && totals.unused === best) {
    return config.flavour === "class"
      ? { text: `${unused} unused: classes cannot do better`, tone: "warn" }
      : { text: `${unused} unused: the least possible`, tone: "good" };
  }
  return { text: best === null ? `${unused} unused` : `${unused} unused; ${formatAddressNumber(best)} is possible`, tone: "warn" };
}

// ---------------------------------------------------------------- classifying

export type AddressKind = "public" | "private" | "shared" | "special";
export const ADDRESS_KINDS: readonly AddressKind[] = ["public", "private", "shared", "special"];

export type KindBlock = { cidr: string; kind: Exclude<AddressKind, "public">; /** What the block is, in a few words. */ label: string };

/**
 * The stated prefix list. Private is RFC 1918; shared is 100.64.0.0/10 (RFC 6598);
 * special is the IANA special-purpose registry rows the course names (dossier
 * section 4.2), the same list as code exercise 2.5. Anything in none of these is
 * public.
 */
export const KIND_BLOCKS: readonly KindBlock[] = [
  { cidr: "10.0.0.0/8", kind: "private", label: "a private block (RFC 1918)" },
  { cidr: "172.16.0.0/12", kind: "private", label: "a private block (RFC 1918)" },
  { cidr: "192.168.0.0/16", kind: "private", label: "a private block (RFC 1918)" },
  { cidr: "100.64.0.0/10", kind: "shared", label: "shared space for provider NAT" },
  { cidr: "0.0.0.0/8", kind: "special", label: "this network, not a real host" },
  { cidr: "127.0.0.0/8", kind: "special", label: "loopback, this computer only" },
  { cidr: "169.254.0.0/16", kind: "special", label: "link-local, set when DHCP fails" },
  { cidr: "192.0.2.0/24", kind: "special", label: "documentation, never real" },
  { cidr: "198.51.100.0/24", kind: "special", label: "documentation, never real" },
  { cidr: "203.0.113.0/24", kind: "special", label: "documentation, never real" },
  { cidr: "198.18.0.0/15", kind: "special", label: "benchmarking" },
  { cidr: "240.0.0.0/4", kind: "special", label: "reserved, includes 255.255.255.255" },
];

/** The first and last address of a CIDR string like "172.16.0.0/12". */
export function cidrRange(cidr: string): { start: number; end: number; prefix: number } {
  const [ip, len] = cidr.split("/");
  const prefix = Number(len);
  assertPrefix(prefix);
  const mask = maskNumber(prefix);
  const start = (ipToNumber(ip) & mask) >>> 0;
  return { start, end: (start | (~mask >>> 0)) >>> 0, prefix };
}

const toNumber = (ip: string | number) => (typeof ip === "number" ? ip : ipToNumber(ip));

/** The listed block that holds this address, or null for a public address. */
export function classifyBlock(ip: string | number): KindBlock | null {
  const n = toNumber(ip);
  for (const block of KIND_BLOCKS) {
    const { start, end } = cidrRange(block.cidr);
    if (n >= start && n <= end) return block;
  }
  return null;
}

/** public, private, shared or special. Throws on a string that is not an address. */
export function classify(ip: string | number): AddressKind {
  return classifyBlock(ip)?.kind ?? "public";
}

/** How near (in addresses) a public address must be to a block edge to count as a near miss: two /16s. */
const NEAR_MISS = 2 ** 17;

/** Why an address is the kind it is, in one sentence. A public address just outside a private or shared block says so. */
export function classifyReason(ip: string): string {
  const n = ipToNumber(ip);
  const block = classifyBlock(n);
  if (block) return `${ip} is inside ${block.cidr}, ${block.label}`;
  for (const candidate of KIND_BLOCKS) {
    if (candidate.kind === "special") continue;
    const { start, end } = cidrRange(candidate.cidr);
    if (n > end && n - end <= NEAR_MISS) return `${ip} is just past ${numberToIp(end)}, where the ${candidate.kind} block ends`;
    if (n < start && start - n <= NEAR_MISS) return `${ip} is just before ${numberToIp(start)}, where the ${candidate.kind} block starts`;
  }
  return `${ip} is in no private, shared or special block, so it is public`;
}

/** The feedback for a try: "Yes. ..." or "Not private. ...". */
export function classifyFeedback(ip: string, tried: AddressKind): { right: boolean; text: string } {
  const right = classify(ip) === tried;
  return { right, text: `${right ? "Yes" : `Not ${tried}`}. ${classifyReason(ip)}` };
}

/** Break a sentence into lines of at most `max` characters, at spaces. A single longer word stays whole. */
export function wrapWords(text: string, max: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && `${line} ${word}`.length > max) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export const classifyConfigSchema = z
  .object({ mode: z.literal("classify"), addresses: z.array(ipv4String).min(4).max(16) })
  .refine((c) => new Set(c.addresses).size === c.addresses.length, { message: "addresses repeat" });
export type ClassifyConfig = z.infer<typeof classifyConfigSchema>;

/** Counts per kind for a list of addresses. */
export function kindCounts(addresses: readonly string[]): Record<AddressKind, number> {
  const counts: Record<AddressKind, number> = { public: 0, private: 0, shared: 0, special: 0 };
  for (const ip of addresses) counts[classify(ip)] += 1;
  return counts;
}

// ---------------------------------------------------------------- CIDR drill

export type PrefixSizeQuestion = {
  kind: "prefix-size";
  prefix: number;
  /** Three block sizes: the answer and the sizes one prefix step either side. */
  options: [number, number, number];
  answer: number;
};
export type PrefixMaskQuestion = {
  kind: "prefix-mask";
  prefix: number;
  /** Three masks, same idea. */
  options: [string, string, string];
  answer: string;
};
export type CidrQuestion = PrefixSizeQuestion | PrefixMaskQuestion;

/** Questions use /9 to /30, so a step either side is always a real prefix between /8 and /31. */
export const CIDR_DRILL_MIN = 9;
export const CIDR_DRILL_MAX = 30;

const CIDR_KINDS: CidrQuestion["kind"][] = ["prefix-size", "prefix-mask", "prefix-size", "prefix-mask", "prefix-size"];

/**
 * Five questions for a set, the same every time for the same set number: three
 * sizes and two masks in a seeded order, each on a different prefix. The two
 * wrong options are the neighbouring prefixes, so the slip is the realistic one.
 */
export function generateCidrDrill(setNumber: number): CidrQuestion[] {
  const rand = seededRandom((seedForSet(setNumber) ^ 0x5bd1e995) >>> 0);
  const order = shuffle(CIDR_KINDS, rand);
  const used = new Set<number>();
  return order.map((kind): CidrQuestion => {
    let prefix: number;
    do {
      prefix = CIDR_DRILL_MIN + Math.floor(rand() * (CIDR_DRILL_MAX - CIDR_DRILL_MIN + 1));
    } while (used.has(prefix));
    used.add(prefix);
    if (kind === "prefix-size") {
      const options = shuffle([blockSize(prefix), blockSize(prefix - 1), blockSize(prefix + 1)], rand) as [number, number, number];
      return { kind, prefix, options, answer: blockSize(prefix) };
    }
    const maskOf = (p: number) => numberToIp(maskNumber(p));
    const options = shuffle([maskOf(prefix), maskOf(prefix - 1), maskOf(prefix + 1)], rand) as [string, string, string];
    return { kind, prefix, options, answer: maskOf(prefix) };
  });
}

/** True when the picked size (a number) or mask (a string) is the answer. */
export function checkCidrAnswer(question: CidrQuestion, answer: number | string): boolean {
  return answer === question.answer;
}

/** The feedback after an answer, in words (short enough for a phone). */
export function explainCidrQuestion(question: CidrQuestion): string {
  const host = ADDRESS_BITS - question.prefix;
  if (question.kind === "prefix-size") return `32 - ${question.prefix} = ${host} host bits, so ${formatAddressNumber(question.answer)}`;
  return `${question.prefix} ones, ${host} zeros: ${question.answer}`;
}

export const drillConfigSchema = z.object({ mode: z.literal("drill"), questions: z.enum(["bits", "cidr"]) });
export type DrillConfig = z.infer<typeof drillConfigSchema>;

// ---------------------------------------------------------------- the parameters of every new mode

export const addrConfigSchema = z.discriminatedUnion("mode", [allocateConfigSchema, prefixConfigSchema, classifyConfigSchema, drillConfigSchema]);
export type AddrConfig = z.infer<typeof addrConfigSchema>;
