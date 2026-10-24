// 11.7 beat 3: no partition. A write in the West must reach a copy in the
// East. Let R be the round trip to the far copy; the local disk write with
// fsync takes 0.3 ms (napkin-math numbers). If the write waits for the far
// copy it takes 0.3 + R ms and East readers are never stale. If it does not
// wait it takes 0.3 ms and East readers can read the old value for R / 2 ms
// (one way trip).

export const FSYNC_MS = 0.3;

export type FarRow = { id: string; name: string; short: string; rtt: number };

export const FAR_ROWS: readonly FarRow[] = [
  { id: "same", name: "in the same region", short: "same region", rtt: 0.25 },
  { id: "na", name: "North America East to West", short: "NA east-west", rtt: 60 },
  { id: "eu-na", name: "EU West to North America East", short: "EU to NA east", rtt: 80 },
  { id: "eu-sg", name: "EU West to Singapore", short: "EU to Singapore", rtt: 160 },
];
export const DEFAULT_ROW = 1;
export const RTT_LADDER: readonly number[] = FAR_ROWS.map((r) => r.rtt);

export const writeMs = (rtt: number, waits: boolean) => (waits ? FSYNC_MS + rtt : FSYNC_MS);
export const staleMs = (rtt: number, waits: boolean) => (waits ? 0 : rtt / 2);

/** 0.55, 60.3, 160.3: up to two decimals, without trailing zeros. */
export function formatMs(ms: number): string {
  const r = Math.round(ms * 100) / 100;
  return String(r);
}

/** The stale window is shown to one decimal below 1 ms ("0.1") and as a whole number above ("30"). */
export function formatStale(ms: number): string {
  if (ms === 0) return "0";
  if (ms < 1) return (Math.round(ms * 10) / 10).toFixed(1);
  return String(Math.round(ms * 10) / 10);
}

export function verdictFor(rtt: number, waits: boolean): { text: string; tone: "good" | "warn" } {
  if (waits) return { text: `Fresh; the write takes ${formatMs(writeMs(rtt, true))} ms`, tone: "good" };
  return { text: `Fast: 0.3 ms; far reads stale ${formatStale(staleMs(rtt, false))} ms`, tone: "warn" };
}

export const BREAK_MS = 20;
/** Bars are drawn to scale up to 20 ms; a longer one fills the track and shows a break mark. */
export function barFraction(ms: number): { fraction: number; broken: boolean } {
  if (ms <= 0) return { fraction: 0, broken: false };
  return { fraction: Math.min(1, ms / BREAK_MS), broken: ms > BREAK_MS };
}

/** On-screen timeline of one write (seconds in a loop): when the write starts, the trip takes TRIP_S each way. */
export const START_S = 0.3;
export const TRIP_S = 1.2;
export const FAST_DONE_S = 0.6;

export function doneAt(waits: boolean): number {
  return waits ? START_S + 2 * TRIP_S : FAST_DONE_S;
}
export const eastUpdatesAt = START_S + TRIP_S;

export type ReaderOutcome = { text: string; tone: "good" | "warn" | undefined };

/** What an East reader gets when it reads at a loop time (seconds). */
export function eastRead(seconds: number, waits: boolean): ReaderOutcome {
  if (seconds >= eastUpdatesAt) return { text: "x = 2, the new value", tone: "good" };
  if (seconds >= doneAt(waits)) return { text: "x = 1, old: stale", tone: "warn" };
  return { text: "x = 1, write not done", tone: undefined };
}
