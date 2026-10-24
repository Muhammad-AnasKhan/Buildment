// 18.6 beat 4: a canary limits how many users a bad release can reach. The
// service handles R requests a minute. The stable version fails 0.2% of them.
// The canary gets a share s of traffic and a bug makes e of its requests fail.
// An alert fires once the canary has produced F failed requests. All numbers
// are made up for the example; the shape (a 20% bug on a 5% canary shows as
// about 1% overall) is from the Google SRE Workbook [S110].

export const REQUESTS_PER_MIN = 3000;
export const STABLE_FAIL = 0.2;
export const ALERT_FAILURES = 30;

export const SHARE_MIN = 1;
export const SHARE_MAX = 50;
export const SHARE_SNAPS: readonly number[] = [5, 10, 25];
export const BUG_MIN = 1;
export const BUG_MAX = 50;
export const BUG_SNAPS: readonly number[] = [5, 20];
export const DEFAULT_SHARE = 5;
export const DEFAULT_BUG = 20;

const ladder = (min: number, max: number) => Array.from({ length: max - min + 1 }, (_, i) => min + i);
export const SHARE_LADDER = ladder(SHARE_MIN, SHARE_MAX);
export const BUG_LADDER = ladder(BUG_MIN, BUG_MAX);

const clamp01 = (f: number) => Math.max(0, Math.min(1, Number.isFinite(f) ? f : 0));

/** Rails are drawn on a square-root scale, so 1% to 5% has room to be dragged. */
export function railToValue(f: number, min: number, max: number, snaps: readonly number[]): number {
  const v = Math.round(min + (max - min) * clamp01(f) ** 2);
  const near = snaps.find((s) => Math.abs(v - s) <= 1);
  return near ?? v;
}
export const valueToRail = (v: number, min: number, max: number) => Math.sqrt(clamp01((v - min) / (max - min)));

/** s and e are percentages (1 to 50). Canary requests a minute = R x s. */
export const canaryRequestsPerMin = (sharePct: number) => (REQUESTS_PER_MIN * sharePct) / 100;
/** Canary failures a minute = R x s x e. */
export const failuresPerMin = (sharePct: number, bugPct: number) => (REQUESTS_PER_MIN * sharePct * bugPct) / 10000;
/** Minutes to the alert = F / (R x s x e). */
export const minutesToAlert = (sharePct: number, bugPct: number) => ALERT_FAILURES / failuresPerMin(sharePct, bugPct);
/** Requests that reached the bug before the alert = R x s x minutes = F / e. */
export const requestsExposed = (bugPct: number) => (ALERT_FAILURES * 100) / bugPct;
/** Whole-service error rate in percent = (1 - s) x 0.2% + s x e. */
export const dashboardRate = (sharePct: number, bugPct: number) => ((100 - sharePct) * STABLE_FAIL + sharePct * bugPct) / 100;

/** "12 s" under a minute, "1.0 min" under ten, then whole minutes. */
export function formatMinutes(min: number): string {
  if (min < 1) return `${Math.round(min * 60)} s`;
  if (min < 10) return `${(Math.round(min * 10) / 10).toFixed(1)} min`;
  return `${Math.round(min)} min`;
}

/** A percentage with up to two decimals and no trailing zero: 5.15%, 1.19%, 0.29%, 5%. */
export function formatPercent(p: number): string {
  return `${String(Math.round(p * 100) / 100)}%`;
}

export const formatCount = (n: number) => Math.round(n).toLocaleString("en-US");

export const isHidden = (sharePct: number, bugPct: number) => dashboardRate(sharePct, bugPct) < 1 && bugPct >= 2;

export type Verdict = { text: string; tone: "good" | "warn" | "bad" | "accent" };

export function verdictFor(sharePct: number, bugPct: number): Verdict {
  if (isHidden(sharePct, bugPct)) return { text: "Bug hidden in the average", tone: "bad" };
  if (minutesToAlert(sharePct, bugPct) > 10) return { text: "Slow to see: raise the share", tone: "warn" };
  if (sharePct >= 25) return { text: "Fast alert, but 1 in 4 users on it", tone: "warn" };
  return { text: "Small share, quick alert", tone: "good" };
}

/** Seconds of picture time for the failures to pile up to the alert: long waits are squeezed so a loop stays watchable. */
export const pileSeconds = (minutes: number) => 1.5 + 1.2 * Math.log2(1 + minutes * 6);

/** A repeatable pseudo-random number in [0, 1) for a pair of whole numbers, so the picture's crowd is the same every time. */
export function unit(a: number, b: number): number {
  let x = Math.imul(a + 1, 374761393) ^ Math.imul(b + 7, 668265263);
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

/** Fraction of the failures piled up (0 to 1) at a time in the loop; the pile holds full for two seconds. */
export function pileProgress(seconds: number, duration: number): number {
  const cycle = duration + 2;
  return Math.min(1, (seconds % cycle) / duration);
}
