// Bloom filter maths for chapter 7.3. A filter with b bits per key and k hash
// functions answers "maybe" for a key that is not stored with probability
// FP = (1 - e^(-k/b))^k [S113]. The best k is about b x ln 2. Pure, so the
// worked values in the chapter are tested.

/** The bits per key the learner can pick. */
export const BITS_LADDER = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20] as const;
export const DEFAULT_BITS = 10;
export const BITS_MIN = BITS_LADDER[0];
export const BITS_MAX = BITS_LADDER[BITS_LADDER.length - 1];
/** Keys in the example: memory is counted for a billion of them. */
export const KEYS = 1_000_000_000;
/** The strip of lookups for keys that are not stored. */
export const LOOKUPS = 100;

export const hashCount = (bits: number) => Math.max(1, Math.round(bits * Math.LN2));

/** The chance that a lookup of an absent key wrongly says "maybe", 0 to 1. */
export function falsePositiveRate(bits: number): number {
  const k = hashCount(bits);
  return (1 - Math.exp(-k / bits)) ** k;
}

/** Gigabytes of filter memory for a billion keys (decimal GB). */
export const memoryGb = (bits: number) => (bits * KEYS) / 8 / 1e9;

/** Wrong "maybe" answers in 1,000 lookups of absent keys. */
export const wastedReadsPer1000 = (bits: number) => Math.round(1000 * falsePositiveRate(bits));

/** One wrong "maybe" in this many lookups, rounded. */
export const oneIn = (bits: number) => Math.round(1 / falsePositiveRate(bits));

/** Amber dots in the strip of 100: the rate rounded, and none when it is under 0.5%. */
export function amberDots(bits: number): number {
  const fp = falsePositiveRate(bits);
  return fp < 0.005 ? 0 : Math.round(fp * LOOKUPS);
}

/** The rate as percent text: two decimals, or two significant figures when tiny. */
export function formatRate(bits: number): string {
  const pct = falsePositiveRate(bits) * 100;
  if (pct < 0.01) return `${Number(pct.toPrecision(2))}%`;
  return `${pct.toFixed(2)}%`;
}

export function formatMemory(bits: number): string {
  return `${Number(memoryGb(bits).toFixed(3))} GB`;
}

export function withCommas(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export type BloomVerdict = { text: string; tone: "warn" | "accent" | "good" };

/** The banner: 38 characters or fewer. */
export function bloomVerdict(bits: number): BloomVerdict {
  const fp = falsePositiveRate(bits);
  if (fp > 0.05) return { text: "Many wasted file reads", tone: "warn" };
  if (fp >= 0.005) return { text: "About 1 wasted read in 100", tone: "accent" };
  return { text: "Few wasted reads, more memory", tone: "good" };
}

/** The ladder rung nearest to a position on the rail, 0 to 1. The rail is linear in bits. */
export function bitsFromFraction(f: number): number {
  const raw = BITS_MIN + Math.max(0, Math.min(1, Number.isFinite(f) ? f : 0)) * (BITS_MAX - BITS_MIN);
  return BITS_LADDER.reduce((best, b) => (Math.abs(b - raw) < Math.abs(best - raw) ? b : best), BITS_LADDER[0] as number);
}

export const bitsToFraction = (bits: number) => (Math.max(BITS_MIN, Math.min(BITS_MAX, bits)) - BITS_MIN) / (BITS_MAX - BITS_MIN);

/** Points of the curve of rate against bits, for drawing. */
export function curvePoints(step = 0.25): { bits: number; rate: number }[] {
  const out: { bits: number; rate: number }[] = [];
  for (let b = BITS_MIN; b <= BITS_MAX + 1e-9; b += step) out.push({ bits: b, rate: falsePositiveRate(b) });
  return out;
}
