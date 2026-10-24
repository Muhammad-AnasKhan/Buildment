// 6.4 "Retry with and without a key": one purchase, the settings of
// challenge 5 part 4. The app waits 250 ms for each try, waits 50 ms and
// retries with the same key; after a 409 it waits 200 ms; at most 4 tries.
// The provider takes p ms for every try that reaches it, and the charge is
// real at (try start + p) even if the app has stopped waiting. Server work
// other than the provider is instant. Pure, no React.

export type KeyMode = "none" | "check" | "claim";

export const KEY_MODES: readonly { id: KeyMode; chip: string; full: string }[] = [
  { id: "none", chip: "No key", full: "No key" },
  { id: "check", chip: "Check, then save", full: "Check the key, then save the reply" },
  { id: "claim", chip: "Claim first", full: "Claim the key first" },
];

export const TIMEOUT_MS = 250;
export const RETRY_WAIT_MS = 50;
export const CONFLICT_WAIT_MS = 200;
export const MAX_TRIES = 4;
export const PROVIDER = { min: 100, max: 600, step: 10, default: 450, snaps: [200, 280, 450, 600] } as const;

export const PROVIDER_LADDER: readonly number[] = Array.from({ length: (PROVIDER.max - PROVIDER.min) / PROVIDER.step + 1 }, (_, i) => PROVIDER.min + i * PROVIDER.step);

export type TryOutcome =
  /** Reached the provider and the reply came back inside the wait. */
  | "answered"
  /** Reached the provider; the app stopped waiting before the reply. */
  | "timeout"
  /** The API found a saved reply and sent it back at once. */
  | "saved"
  /** The API found the key pending and sent 409 at once. */
  | "conflict";

export type Try = {
  n: number;
  /** When the app sent it, ms from the first try. */
  start: number;
  outcome: TryOutcome;
  /** Whether the try reached the provider (a charge will land). */
  reachesProvider: boolean;
  /** When this try's charge lands, ms; null if it never reaches the provider. */
  chargeAt: number | null;
  /** When the app stops waiting on this try, ms. */
  endAt: number;
};

export type RetryRun = {
  mode: KeyMode;
  providerMs: number;
  tries: Try[];
  /** The time of every charge, ms, in order. */
  charges: number[];
  /** When the app learns the purchase worked, or null if it never does. */
  confirmedAt: number | null;
  /** When the app's last try ends, ms. */
  endAt: number;
  /** When the last thing in the picture happens, ms. */
  lastEventAt: number;
  /** When the provider's reply is saved or the key marked done, ms; null in "none" mode. */
  keyDoneAt: number | null;
};

export function clampProvider(ms: number): number {
  if (!Number.isFinite(ms)) return PROVIDER.default;
  return Math.max(PROVIDER.min, Math.min(PROVIDER.max, Math.round(ms / PROVIDER.step) * PROVIDER.step));
}

export function runRetries(rawMs: number, mode: KeyMode): RetryRun {
  const p = clampProvider(rawMs);
  const tries: Try[] = [];
  let start = 0;
  let confirmedAt: number | null = null;
  for (let n = 1; n <= MAX_TRIES; n++) {
    // Does this try find the first try's reply already saved, or its key still pending?
    const keyDone = mode !== "none" && n > 1 && p <= start;
    const keyPending = mode === "claim" && n > 1 && p > start;
    if (keyDone) {
      tries.push({ n, start, outcome: "saved", reachesProvider: false, chargeAt: null, endAt: start });
      confirmedAt = start;
      break;
    }
    if (keyPending) {
      tries.push({ n, start, outcome: "conflict", reachesProvider: false, chargeAt: null, endAt: start });
      start += CONFLICT_WAIT_MS;
      continue;
    }
    const answered = p <= TIMEOUT_MS;
    tries.push({ n, start, outcome: answered ? "answered" : "timeout", reachesProvider: true, chargeAt: start + p, endAt: start + (answered ? p : TIMEOUT_MS) });
    if (answered) {
      confirmedAt = start + p;
      break;
    }
    start += TIMEOUT_MS + RETRY_WAIT_MS;
  }
  const charges = tries.flatMap((t) => (t.chargeAt === null ? [] : [t.chargeAt])).sort((a, b) => a - b);
  const endAt = Math.max(...tries.map((t) => t.endAt));
  const keyDoneAt = mode === "none" ? null : p;
  return { mode, providerMs: p, tries, charges, confirmedAt, endAt, lastEventAt: Math.max(endAt, ...charges), keyDoneAt };
}

export type RetryVerdict = { text: string; tone: "good" | "bad" };

export function retryVerdict(run: RetryRun): RetryVerdict {
  const p = run.providerMs;
  if (p <= TIMEOUT_MS) return { text: "Answer in time: 1 charge, any mode", tone: "good" };
  if (run.mode === "none") return { text: "No key: 4 charges, app says failed", tone: "bad" };
  if (run.mode === "claim") return { text: "Claim first: 1 charge, always", tone: "good" };
  if (p <= 300) return { text: "Saved in time: 1 charge", tone: "good" };
  return { text: "Check, then save: 2 charges", tone: "bad" };
}

/** Charges landed by time t (ms). */
export function chargesBy(run: RetryRun, t: number): number {
  return run.charges.filter((c) => c <= t).length;
}

export type KeyStore = { text: string; tone: "good" | "warn" | "accent" | undefined };

/** What the API's key store holds at time t (ms). */
export function keyStoreAt(run: RetryRun, t: number): KeyStore {
  if (run.mode === "none") return { text: "no key store", tone: undefined };
  if (t < 0) return { text: "key: empty", tone: undefined };
  const done = run.keyDoneAt !== null && t >= run.keyDoneAt;
  if (run.mode === "check") return done ? { text: "saved: reply", tone: "good" } : { text: "saved: nothing", tone: undefined };
  return done ? { text: "key: done", tone: "good" } : { text: "key: pending", tone: "warn" };
}

export type PhoneStatus = { text: string; tone: "good" | "bad" | "accent" | undefined };

export function phoneAt(run: RetryRun, t: number): PhoneStatus {
  if (run.confirmedAt !== null && t >= run.confirmedAt) return { text: "paid", tone: "good" };
  if (run.confirmedAt === null && t >= run.endAt) return { text: "app says failed", tone: "bad" };
  if (t < 0) return { text: "taps Pay", tone: undefined };
  return { text: "waiting", tone: "accent" };
}

/** The try the app is working on at time t, with how far its 250 ms wait has run (0 to 1), or null between tries. */
export function waitingAt(run: RetryRun, t: number): { n: number; fraction: number } | null {
  for (const tr of run.tries) {
    if (tr.outcome === "saved" || tr.outcome === "conflict") continue;
    const end = tr.start + (tr.outcome === "answered" ? tr.endAt - tr.start : TIMEOUT_MS);
    if (t >= tr.start && t < end) return { n: tr.n, fraction: (t - tr.start) / TIMEOUT_MS };
  }
  return null;
}
