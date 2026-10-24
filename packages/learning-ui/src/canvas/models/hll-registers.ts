import { withCommas } from "./picture-controls";

// 23.4 "HyperLogLog counts different shoppers". With m registers the standard
// error of a HyperLogLog count is 1.04 / sqrt(m) [S114], and each register takes
// 6 bits (Redis: 16,384 registers, 12 KB, 0.81% [S115]). Pure functions, no React.

/** Registers the learner can pick: powers of 2 from 2^4 to 2^14. */
export const REGISTER_LADDER = [16, 64, 256, 1024, 4096, 16384] as const;
export const DEFAULT_REGISTERS = 1024;
/** Different shoppers in a day (chapter 23.1). */
export const SHOPPERS = 50_000_000;
/** The number line runs from 0 to this many. */
export const LINE_MAX = 100_000_000;
export const BITS_PER_REGISTER = 6;
/** Bytes for an exact set: 8 bytes for each of 50 million IDs. */
export const EXACT_BYTES = SHOPPERS * 8;

/** The standard error as a fraction: 0.0325 is 3.25%. */
export const standardError = (m: number) => 1.04 / Math.sqrt(m);

/** The count that is `errors` standard errors from the truth, below (-1) or above (+1). */
export const bandEdge = (m: number, errors: number, side: -1 | 1) => SHOPPERS * (1 + side * errors * standardError(m));

export type Band = { lo: number; hi: number };
export const band = (m: number, errors: number): Band => ({ lo: bandEdge(m, errors, -1), hi: bandEdge(m, errors, 1) });

/** Memory of the registers in bytes. */
export const memoryBytes = (m: number) => (BITS_PER_REGISTER * m) / 8;

/** Bytes as the picture writes them: "768 B", "3 KB", "12 KB", "400 MB" (a KB is 1,024 bytes, as in the chapter). */
export function bytesText(n: number): string {
  if (n >= 1_000_000) return `${Number((n / 1_000_000).toFixed(1))} MB`;
  if (n >= 1000) return `${Number((n / 1024).toFixed(2))} KB`;
  return `${Math.round(n)} B`;
}

/** The exact memory divided by the sketch memory, rounded: 32,552 at 12 KB. */
export const memoryRatio = (m: number) => Math.round(EXACT_BYTES / memoryBytes(m));
export const ratioText = (m: number) => `1 / ${withCommas(memoryRatio(m))} of the exact memory`;

export const percentText = (fraction: number) => `${Number((fraction * 100).toFixed(2))}%`;

/** Millions with two decimals: "48.38". Nudged so a value on a tie rounds up, as the spec's table does. */
export const millionsText = (n: number) => (Math.round(n / 1e4 + 1e-6) / 100).toFixed(2);

export type Verdict = { text: string; tone: "bad" | "warn" | "good" };

/** At most 38 characters. */
export function hllVerdict(m: number): Verdict {
  const s = standardError(m);
  if (s > 0.05) return { text: "Too rough to trust", tone: "bad" };
  if (s >= 0.01) return { text: "Fine for a dashboard", tone: "warn" };
  return { text: "Under 1% error in 12 KB", tone: "good" };
}

/** Position on the rail (0 to 1): the registers are evenly spaced, one rung for each doubling of the error. */
export const registersToFraction = (m: number) => {
  const i = REGISTER_LADDER.indexOf(m as (typeof REGISTER_LADDER)[number]);
  return (i < 0 ? 0 : i) / (REGISTER_LADDER.length - 1);
};
export function registersFromFraction(f: number): number {
  const x = Number.isFinite(f) ? Math.max(0, Math.min(1, f)) : 0;
  return REGISTER_LADDER[Math.round(x * (REGISTER_LADDER.length - 1))];
}

/**
 * One run's estimate at time t (seconds): wobbles around the truth by up to
 * 1.4 standard errors, so now and then it leaves the dark band but stays in the light one.
 * Deterministic, so a frozen picture is repeatable.
 */
export function wobble(m: number, t: number): number {
  const u = (Math.sin(t * 1.7) + Math.sin(t * 2.9 + 1.3)) / 2;
  return SHOPPERS * (1 + 1.4 * u * standardError(m));
}

/** The slider sentence. */
export function registersValueText(m: number): string {
  const b = band(m, 1);
  return `${withCommas(m)} registers, ${bytesText(memoryBytes(m))}: typical error ${percentText(standardError(m))}, so a count of 50 million usually reads between ${millionsText(b.lo)} and ${millionsText(b.hi)} million. ${hllVerdict(m).text}`;
}
