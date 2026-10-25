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
      return `${parsed.error.message}, so it cannot exist`;
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
