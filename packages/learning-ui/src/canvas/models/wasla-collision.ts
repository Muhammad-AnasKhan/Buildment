import { withCommas } from "./picture-controls";
import { formatCount, sig3 } from "./envelope-estimate";
import { CREATES_PER_SECOND } from "./wasla-numbers";

// 20.3 "Drag the length, watch the clashes". Random codes of L characters from
// 62 letters and digits. Pure functions, no React.
//
//   possible codes    = 62^L
//   share taken f     = n / 62^L        (full when f is 1 or more)
//   extra tries/create = f / (1 - f)    (1 create in 1/f must retry)
//   extra tries/second = 193 x f / (1 - f)
//   first clash after about 1.2533 x sqrt(62^L) links (the birthday bound)

export const LENGTH_MIN = 4;
export const LENGTH_MAX = 9;
export const LENGTH_DEFAULT = 6;
export const LENGTHS: readonly number[] = [4, 5, 6, 7, 8, 9];

/** Stored links the arrow keys step through, and the points a drag snaps to. */
export const LINK_SNAPS: readonly number[] = [1e6, 1e8, 1e9, 1e10, 3e10];
/** The rail starts at 1,000 links so the first-clash marker is always on it. */
export const LINK_MIN = 1_000;
/** The values the arrow keys step through, left end first. */
export const LINK_LADDER: readonly number[] = [1_000, ...LINK_SNAPS];
export const LINK_MAX = 3e10;
export const LINK_DEFAULT = 3e10;

const LOG_MIN = Math.log10(LINK_MIN);
const LOG_SPAN = Math.log10(LINK_MAX) - LOG_MIN;

/** Position of n on the log rail, 0 to 1. */
export const linkFraction = (n: number) => Math.max(0, Math.min(1, (Math.log10(Math.max(1, n)) - LOG_MIN) / LOG_SPAN));

/** Stored links at a position on the rail: snaps near the chapter's points, else two figures. */
export function linkFromFraction(f: number): number {
  const raw = Math.pow(10, LOG_MIN + Math.max(0, Math.min(1, Number.isFinite(f) ? f : 1)) * LOG_SPAN);
  for (const s of LINK_SNAPS) if (Math.abs(Math.log10(raw / s)) < 0.045) return s;
  const unit = Math.pow(10, Math.floor(Math.log10(raw)) - 1);
  return Math.max(LINK_MIN, Math.min(LINK_MAX, Math.round(raw / unit) * unit));
}

export const possibleCodes = (length: number) => Math.pow(62, length);

/** Links after which the first clash is expected: about 1.2533 x sqrt(62^L). */
export const firstClash = (length: number) => 1.2533 * Math.sqrt(possibleCodes(length));

export type Collision = {
  length: number;
  links: number;
  codes: number;
  /** Share of codes taken. Can pass 1 (more links than codes). */
  share: number;
  full: boolean;
  /** Average extra tries for one create: f / (1 - f). Infinity when full. */
  extraPerCreate: number;
  /** One create in this many must retry: round(1 / f), at least 1. Infinity when f is 0. */
  oneIn: number;
  extraPerSecond: number;
  firstClash: number;
};

export function collision(length: number, links: number): Collision {
  const L = Math.max(LENGTH_MIN, Math.min(LENGTH_MAX, Math.round(length)));
  const codes = possibleCodes(L);
  const share = links / codes;
  const full = share >= 1;
  const extraPerCreate = full ? Infinity : share / (1 - share);
  return {
    length: L,
    links,
    codes,
    share,
    full,
    extraPerCreate,
    oneIn: share > 0 ? Math.max(1, Math.round(1 / share)) : Infinity,
    extraPerSecond: CREATES_PER_SECOND * extraPerCreate,
    firstClash: firstClash(L),
  };
}

/** A big count in words: "14.8 million", "3.52 trillion", "13.5 quadrillion". */
export function bigCount(n: number): string {
  if (n >= 1e15) return `${sig3(n / 1e15)} quadrillion`;
  if (n >= 1e12) return `${sig3(n / 1e12)} trillion`;
  return formatCount(n);
}

/** The share of codes taken as a percentage text: "53%", "6.8%", "0.85%", "0.0000074%". */
export function percentText(share: number): string {
  const pct = share * 100;
  if (pct >= 10) return `${Math.round(pct)}%`;
  if (pct >= 1) return `${pct.toFixed(1)}%`;
  return `${pct.toFixed(Math.max(0, 1 - Math.floor(Math.log10(pct))))}%`;
}

/** Below this share the picture says "almost none" instead of a long decimal. */
const NEGLIGIBLE = 1e-8;

/** The label under the bar. */
export function takenLabel(c: Collision): string {
  if (c.full) return "all codes taken";
  if (c.share < NEGLIGIBLE) return "almost none taken";
  return `${percentText(c.share)} of codes taken`;
}

/** First number card: "1 in 117", "every create", "none free". */
export function oneInText(c: Collision): string {
  if (c.full) return "none free";
  if (c.share < NEGLIGIBLE) return "almost never";
  return c.oneIn <= 1 ? "every create" : `1 in ${c.oneIn < 1e6 ? withCommas(c.oneIn) : bigCount(c.oneIn)}`;
}

/** Second number card: "1.66 /s", "216 /s", "under 0.001 /s". */
export function extraPerSecondText(c: Collision): string {
  if (c.full) return "endless";
  if (c.extraPerSecond < 0.001) return "under 0.001 /s";
  return `${sig3(c.extraPerSecond)} /s`;
}

export type Verdict = { text: string; tone: "good" | "warn" | "bad" };

/** At most 38 characters. */
export function collisionVerdict(c: Collision): Verdict {
  if (c.full) return { text: "More links than codes", tone: "bad" };
  if (c.share >= 0.25) return { text: c.oneIn <= 1 ? "Every create must retry" : `1 create in ${c.oneIn} must retry`, tone: "bad" };
  if (c.share >= 0.01) return { text: `1 create in ${c.oneIn} must retry`, tone: "warn" };
  return { text: "Clashes are rare; a retry covers it", tone: "good" };
}

/** Value text for both rails, for a screen reader. */
export function collisionValueText(c: Collision): string {
  const base = `${c.length} characters, ${formatCount(c.links)} links`;
  if (c.full) return `${base}, more links than codes`;
  if (c.share < NEGLIGIBLE) return `${base}, almost no codes taken, clashes almost never`;
  return `${base}, ${percentText(c.share).replace("%", "")} percent of codes taken, 1 create in ${withCommas(c.oneIn)} retries`;
}
