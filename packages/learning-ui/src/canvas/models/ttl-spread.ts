import type { Tone } from "../primitives/tones";

// 3.3: after a DNS change, how many resolvers have the new answer? Pure, no React.
//
// There are 20 resolvers. At the moment of the change, resolver i holds a copy
// aged (i + 0.5) / 20 x TTL. A resolver switches to the new answer when its
// copy expires, which is at TTL minus the copy's age. So the share on the new
// answer grows in a straight line, share(t) = min(1, t / TTL), and every
// resolver has it after one TTL. With a TTL of 0 nothing is cached.

export const RESOLVERS = 20;

export type TtlStep = { seconds: number; chip: string; words: string };

/** 60 s is the ELB TTL; 300 s, 1 hour and 1 day are illustrative. */
export const TTL_STEPS: readonly TtlStep[] = [
  { seconds: 0, chip: "0 s", words: "0 seconds" },
  { seconds: 60, chip: "60 s", words: "60 seconds" },
  { seconds: 300, chip: "5 min", words: "5 minutes" },
  { seconds: 3600, chip: "1 hour", words: "1 hour" },
  { seconds: 86_400, chip: "1 day", words: "1 day" },
] as const;

export const DEFAULT_TTL = 3600;

/** The time rail runs from the change to this share of the TTL. */
export const TIME_MAX_PCT = 120;
/** Rail values: whole percents of the TTL. */
export const TIME_LADDER: readonly number[] = Array.from({ length: TIME_MAX_PCT + 1 }, (_, i) => i);

/** Age of resolver i's copy at the moment of the change. */
export const copyAge = (i: number, ttl: number): number => ((i + 0.5) / RESOLVERS) * ttl;

/** Seconds after the change at which resolver i holds the new answer. */
export const switchTime = (i: number, ttl: number): number => ttl - copyAge(i, ttl);

/** How many of the 20 resolvers hold the new answer t seconds after the change. */
export function resolversOnNew(ttl: number, t: number): number {
  if (!Number.isFinite(ttl) || ttl <= 0) return RESOLVERS;
  const at = Number.isFinite(t) ? Math.max(0, t) : 0;
  let n = 0;
  for (let i = 0; i < RESOLVERS; i++) if (switchTime(i, ttl) <= at + 1e-9) n++;
  return n;
}

export const timeAtPct = (ttl: number, pct: number): number => (Math.max(0, ttl) * pct) / 100;

export const pctToFraction = (pct: number): number => Math.max(0, Math.min(1, pct / TIME_MAX_PCT));

/** A point on the rail as a whole percent of the TTL, snapping to the TTL itself. */
export function pctFromFraction(f: number): number {
  const t = Number.isFinite(f) ? Math.max(0, Math.min(1, f)) : 0;
  const pct = t * TIME_MAX_PCT;
  if (Math.abs(pct - 100) < 1.5) return 100;
  return Math.round(pct);
}

/** 600 → "10 min", 45 → "45 s", 28 800 → "8 h", 100 000 → "1.2 days". */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0 s";
  const trim = (v: number) => String(Number(v.toFixed(1)));
  if (seconds < 120) return `${Math.round(seconds)} s`;
  if (seconds < 7200) return `${Math.round(seconds / 60)} min`;
  if (seconds < 172_800) return `${trim(seconds / 3600)} h`;
  return `${trim(seconds / 86_400)} days`;
}

export type SpreadVerdict = { text: string; tone: Tone };

export function spreadVerdict(ttl: number, onNew: number): SpreadVerdict {
  if (ttl <= 0) return { text: "TTL 0: every lookup gets the change", tone: "good" };
  if (onNew >= RESOLVERS) return { text: "All 20 on the new address", tone: "good" };
  if (ttl >= 86_400) return { text: "1-day TTL: up to a day to move", tone: onNew === 0 ? "bad" : "warn" };
  return { text: `${RESOLVERS - onNew} of ${RESOLVERS} still on the old address`, tone: onNew === 0 ? "bad" : "warn" };
}

// ---------- Motion: the clock sweeps by itself until the learner takes over ----------

const LEAD_S = 0.8;
const SWEEP_S = 6.5;
const HOLD_S = 2.2;

/** Percent of the TTL the clock shows at `seconds`, sweeping 0 to the end of the rail, then pausing. */
export function sweepPct(seconds: number): number {
  if (!Number.isFinite(seconds)) return TIME_MAX_PCT;
  const loop = LEAD_S + SWEEP_S + HOLD_S;
  const t = ((seconds % loop) + loop) % loop;
  if (t < LEAD_S) return 0;
  if (t > LEAD_S + SWEEP_S) return TIME_MAX_PCT;
  return Math.round(((t - LEAD_S) / SWEEP_S) * TIME_MAX_PCT);
}
