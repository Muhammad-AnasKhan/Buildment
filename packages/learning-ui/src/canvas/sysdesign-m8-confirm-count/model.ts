// 8.3 beat 3: how many followers must confirm before the leader says OK.
// A leader with a disk write of 0.3 ms [S3] and two followers: West, 60 ms
// round trip, and EU, 80 ms round trip [S3]. 500 writes a second is made up.
//
//   write time = 0.3 ms + the k-th smallest round trip among live followers
//                (0.3 ms when k = 0)
//   copies at OK = 1 + k
//   writes at risk (k = 0 only) = write rate x the smallest one-way delay
//   fewer than k live followers: writes stall

export const DISK_MS = 0.3;
export const WRITES_PER_SECOND = 500;
export const K_LADDER = [0, 1, 2] as const;
export type K = 0 | 1 | 2;

export type FollowerId = "west" | "eu";
export const FOLLOWERS: Record<FollowerId, { label: string; rttMs: number; oneWayMs: number }> = {
  west: { label: "West", rttMs: 60, oneWayMs: 30 },
  eu: { label: "EU", rttMs: 80, oneWayMs: 40 },
};
export const ORDER: readonly FollowerId[] = ["west", "eu"];

export const DEFAULT_K: K = 1;

export function clampK(value: number): K {
  if (!Number.isFinite(value)) return DEFAULT_K;
  return Math.max(0, Math.min(2, Math.round(value))) as K;
}

const round1 = (v: number) => Math.round(v * 10) / 10;

export type Outcome = {
  k: K;
  westOn: boolean;
  /** Followers that are switched on, fastest round trip first. */
  live: FollowerId[];
  stalled: boolean;
  /** The k followers the leader waits for, fastest first. */
  waitedFor: FollowerId[];
  /** Milliseconds from the client's send to OK; null when writes are stalled. */
  writeMs: number | null;
  /** Copies the leader knows about at OK: itself plus the k confirmations; null when stalled. */
  copies: number | null;
  /** Acknowledged writes lost to one leader crash. Only k = 0 can lose any. */
  atRisk: number;
  /** Whole-picture failures the OK survives: k. */
  survives: number;
};

export function confirmOutcome(kIn: number, westOn: boolean): Outcome {
  const k = clampK(kIn);
  const live = ORDER.filter((id) => id !== "west" || westOn).sort((a, b) => FOLLOWERS[a].rttMs - FOLLOWERS[b].rttMs);
  const stalled = live.length < k;
  const waitedFor = stalled ? [] : live.slice(0, k);
  const writeMs = stalled ? null : round1(DISK_MS + (k === 0 ? 0 : FOLLOWERS[waitedFor[k - 1]].rttMs));
  const nearest = live.length ? Math.min(...live.map((id) => FOLLOWERS[id].oneWayMs)) : 0;
  const atRisk = k === 0 ? Math.round((WRITES_PER_SECOND * nearest) / 1000) : 0;
  return { k, westOn, live, stalled, waitedFor, writeMs, copies: stalled ? null : 1 + k, atRisk, survives: k };
}

export function msText(ms: number): string {
  return Number.isInteger(ms) ? `${ms} ms` : `${ms.toFixed(1)} ms`;
}

export type Verdict = { text: string; tone: "good" | "warn" | "bad" };

export function confirmVerdict(o: Outcome): Verdict {
  if (o.stalled) return { text: "Writes stuck: not enough followers", tone: "bad" };
  if (o.k === 0) return { text: `Fast, but ${o.atRisk} writes at risk`, tone: "warn" };
  const ms = Math.round(o.writeMs ?? 0);
  return { text: `${ms} ms a write; survives ${o.k} ${o.k === 1 ? "failure" : "failures"}`, tone: "good" };
}

/** When the copy to a follower leaves, arrives, and its confirmation is back at the leader (ms from the client's send). */
export function trip(id: FollowerId): { out: number; arrive: number; back: number } {
  const f = FOLLOWERS[id];
  return { out: DISK_MS, arrive: DISK_MS + f.oneWayMs, back: DISK_MS + f.rttMs };
}

/** The time axis the picture draws, in ms. */
export const AXIS_MS = 90;
/** Seconds the cursor takes to sweep the axis, and the pause at the end. */
export const SWEEP_SECONDS = 4;
export const HOLD_SECONDS = 1.6;

/** Where the sweeping cursor is, in ms; reduced motion (a huge clock) shows the end. */
export function cursorMs(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds >= 1e5) return AXIS_MS;
  const c = ((seconds % (SWEEP_SECONDS + HOLD_SECONDS)) + SWEEP_SECONDS + HOLD_SECONDS) % (SWEEP_SECONDS + HOLD_SECONDS);
  return Math.min(AXIS_MS, (c / SWEEP_SECONDS) * AXIS_MS);
}
