// 16.4 beat 5: a herd of clients that fail at the same moment. 1,000 clients
// call in second 0; the server serves 100 calls per one-second slot and
// rejects the rest at once. A rejected client retries after a delay that
// depends on the wait rule. Expected values, no randomness. Same function as
// `herd` in the module 16 playable specs. Pure, no React.

import type { Tone } from "../primitives/tones";
import { withCommas } from "../models/picture-controls";

export type Wait = "now" | "backoff" | "jitter";

export const CLIENTS = 1000;
export const CAPACITY = 100;
export const CAP_SECONDS = 16;
export const SLOTS = 40;
/** The strip shows the first twenty seconds. */
export const SHOWN = 20;
export const RETRY_STOPS = [2, 4, 6, 8] as const;
export const RETRY_DEFAULT = 6;
export const WAIT_DEFAULT: Wait = "backoff";

export const WAITS: readonly { id: Wait; text: string; label: string }[] = [
  { id: "now", text: "At once", label: "Retry at once" },
  { id: "backoff", text: "Backoff", label: "Wait 1, 2, 4, 8 seconds, the same for every client" },
  { id: "jitter", text: "Backoff + jitter", label: "Wait a random time up to the backoff" },
];

export type Herd = {
  retries: number;
  wait: Wait;
  arrivals: number[];
  calls: number;
  served: number;
  gaveUp: number;
  servedBy: number[];
  peak: number;
};

export function herd(retries: number, wait: Wait, clients = CLIENTS, capacity = CAPACITY, cap = CAP_SECONDS, slots = SLOTS): Herd {
  // pending[t][k]: clients who make their k-th try in slot t (k = 0 is the first call).
  const pending = Array.from({ length: slots + cap + 2 }, () => new Array<number>(retries + 1).fill(0));
  pending[0][0] = clients;
  const arrivals: number[] = [];
  const servedBy: number[] = [];
  let served = 0;
  let gaveUp = 0;
  let calls = 0;
  for (let t = 0; t < slots; t++) {
    const row = pending[t];
    const total = row.reduce((a, b) => a + b, 0);
    arrivals.push(total);
    calls += total;
    const ok = Math.min(total, capacity);
    served += ok;
    // The excess is rejected in proportion to each attempt group.
    const failShare = total > 0 ? (total - ok) / total : 0;
    for (let k = 0; k <= retries; k++) {
      const fail = row[k] * failShare;
      if (fail <= 0) continue;
      if (k === retries) {
        gaveUp += fail;
        continue;
      }
      const next = k + 1;
      if (wait === "now") pending[t + 1][next] += fail;
      else if (wait === "backoff") pending[t + Math.min(cap, 2 ** (next - 1))][next] += fail;
      else {
        const max = Math.min(cap, 2 ** next);
        for (let d = 1; d <= max; d++) pending[t + d][next] += fail / max;
      }
    }
    servedBy.push(served);
  }
  return { retries, wait, arrivals, calls, served, gaveUp, servedBy, peak: Math.max(...arrivals) };
}

/** The first whole second by which all the clients are served, or null. */
export function allServedBy(h: Herd): number | null {
  const i = h.servedBy.findIndex((s) => s >= CLIENTS - 0.5);
  return i === -1 ? null : i + 1;
}

/** The next waves after the first call, for example [900, 800, 700]. */
export function waves(h: Herd, count = 3): number[] {
  return h.arrivals
    .slice(1)
    .filter((a) => Math.round(a) > 0)
    .slice(0, count)
    .map((a) => Math.round(a));
}

export function verdictFor(h: Herd): { text: string; tone: Tone } {
  if (h.wait === "backoff") return { text: `Waves of ${waves(h).join(", ")}: lockstep`, tone: "bad" };
  const served = Math.round(h.served);
  if (h.wait === "jitter" && served >= CLIENTS) return { text: `All ${withCommas(CLIENTS)} served by ${allServedBy(h)} s`, tone: "good" };
  if (h.wait === "jitter" && served >= 990) return { text: `${served} of ${withCommas(CLIENTS)} served`, tone: "good" };
  return { text: `Only ${served} of ${withCommas(CLIENTS)} served`, tone: "warn" };
}

export function valueText(h: Herd): string {
  return `${h.retries} retries allowed, ${Math.round(h.served)} of ${withCommas(CLIENTS)} clients served, ${Math.round(h.calls)} calls in all`;
}

export function textAlternative(h: Herd): string {
  const first = h.arrivals.slice(0, SHOWN).map((a) => Math.round(a));
  return `Arrivals each second for the first ${SHOWN} seconds: ${first.join(", ")}. Peak ${withCommas(h.peak)}; the server serves ${CAPACITY} a second. ${Math.round(h.served)} of ${withCommas(CLIENTS)} clients served, ${Math.round(h.gaveUp)} gave up, ${withCommas(Math.round(h.calls))} calls in all.`;
}
