import { BITS_LADDER, bitsFromFraction, bitsToFraction, withCommas } from "./bloom";

// 23.4 "Drag the bits and the hashes". The Bloom filter of chapter 7.3 (models/bloom.ts)
// with the hash count made a second input. For b bits per word and k hashes,
// the chance that a typo wrongly says "maybe" is FP = (1 - e^(-k/b))^k [S113],
// and the best k for a given b is about b x ln 2. Pure functions, no React.

export { BITS_LADDER, bitsFromFraction, bitsToFraction, withCommas };

export const DEFAULT_BITS = 10;
export const DEFAULT_HASHES = 7;
export const HASH_MIN = 1;
export const HASH_MAX = 20;
/** Every whole number of hashes from 1 to 20. */
export const HASH_LADDER: readonly number[] = Array.from({ length: HASH_MAX - HASH_MIN + 1 }, (_, i) => HASH_MIN + i);
/** Words in the filter: 100 million. */
export const WORDS = 100_000_000;
/** Typos in the strip. */
export const TYPOS = 100;
/** Cells in the bit row. */
export const CELLS = 50;
/** The ratio to the best rate that still counts as near the best. */
export const NEAR_BEST = 1.15;

/** The chance that a typo wrongly says "maybe", 0 to 1. */
export function wrongMaybe(bits: number, hashes: number): number {
  return (1 - Math.exp(-hashes / bits)) ** hashes;
}

/** The best number of hashes for b bits per word. */
export const bestHashes = (bits: number) => Math.max(1, Math.round(bits * Math.LN2));

/** How many times worse than the best hash count this one is; 1 is the best. */
export const ratioToBest = (bits: number, hashes: number) => wrongMaybe(bits, hashes) / wrongMaybe(bits, bestHashes(bits));

/** The share of bits that are 1, 0 to 1. */
export const shareSet = (bits: number, hashes: number) => 1 - Math.exp(-hashes / bits);

/** Cells of the bit row that are filled. */
export const filledCells = (bits: number, hashes: number) => Math.round(shareSet(bits, hashes) * CELLS);

/** Megabytes for 100 million words (decimal MB). */
export const memoryMb = (bits: number) => (bits * WORDS) / 8 / 1e6;

export function memoryText(bits: number): string {
  return `${Number(memoryMb(bits).toFixed(1))} MB`;
}

/** The rate as percent text: two decimals, or two significant figures when tiny. */
export function rateText(fp: number): string {
  const pct = fp * 100;
  if (pct < 0.01) return `${Number(pct.toPrecision(2))}%`;
  return `${pct.toFixed(2)}%`;
}

export const sharePercent = (bits: number, hashes: number) => `${(shareSet(bits, hashes) * 100).toFixed(1)}%`;

/** Amber typos in the strip of 100. */
export const amberTypos = (bits: number, hashes: number) => Math.round(wrongMaybe(bits, hashes) * TYPOS);

export function oneInText(fp: number): string {
  const n = Math.round(1 / fp);
  return n <= 1 ? "nearly every typo" : `about 1 typo in ${withCommas(n)}`;
}

export type Verdict = { text: string; tone: "good" | "warn" | "bad" };

/** At most 38 characters. */
export function bloomSizeVerdict(bits: number, hashes: number): Verdict {
  const fp = wrongMaybe(bits, hashes);
  const best = bestHashes(bits);
  if (ratioToBest(bits, hashes) > NEAR_BEST) {
    return hashes < best ? { text: "Too few hashes: typos slip through", tone: "warn" } : { text: "Too many hashes: the row fills up", tone: "warn" };
  }
  if (fp < 0.01) return { text: "Near the best hash count, few errors", tone: "good" };
  if (fp < 0.05) return { text: "Best hashes, but add more bits", tone: "warn" };
  return { text: "Best hashes, still too many errors", tone: "bad" };
}

/** Rail position (0 to 1) and back for the hash count; linear, one step for each whole number. */
export const hashesToFraction = (k: number) => (Math.max(HASH_MIN, Math.min(HASH_MAX, k)) - HASH_MIN) / (HASH_MAX - HASH_MIN);
export function hashesFromFraction(f: number): number {
  const x = Number.isFinite(f) ? Math.max(0, Math.min(1, f)) : 0;
  return Math.round(HASH_MIN + x * (HASH_MAX - HASH_MIN));
}

/** Points of the curve of the rate against the number of hashes, for drawing. */
export function hashCurve(bits: number, step = 0.25): { hashes: number; rate: number }[] {
  const out: { hashes: number; rate: number }[] = [];
  for (let k = HASH_MIN; k <= HASH_MAX + 1e-9; k += step) out.push({ hashes: k, rate: wrongMaybe(bits, k) });
  return out;
}

/** The slider sentence: bits, hashes, rate, share of bits set, memory and verdict. */
export function sizeValueText(bits: number, hashes: number): string {
  const fp = wrongMaybe(bits, hashes);
  return `${bits} bits per word, ${hashes} ${hashes === 1 ? "hash" : "hashes"}: ${rateText(fp)} of typos wrongly say maybe, ${oneInText(fp)}. ${sharePercent(bits, hashes)} of the bits are set. ${memoryText(bits)} for 100 million words. Best is ${bestHashes(bits)} hashes. ${bloomSizeVerdict(bits, hashes).text}`;
}
