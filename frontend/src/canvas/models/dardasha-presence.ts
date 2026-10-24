import { withCommas } from "./picture-controls";
import { GATEWAYS, OPEN_LINES, PEAK_MESSAGES, PRESENCE_CHANGES, REGISTRY_PLAN } from "./dardasha-numbers";
import type { Tone } from "../primitives/tones";

// 22.4 "Drag the ping gap, watch the cost". Presence is a heartbeat from every
// connected phone, so its cost is connected phones divided by the gap, not the
// message rate. Pure functions, no React.
//
//   pings a second        = 3,000,000 / gap
//   times the message rate = pings a second / 13,889
//   shown offline after   = 2 x gap seconds
//   store writes a second: store mode = pings a second;
//     gateway mode = 3,125 status changes + 60 gateway leases renewed every 5 s (12 a second)

export const GAP_STEPS = [5, 15, 30, 60, 120] as const;
export const GAP_DEFAULT = 30;
export type PingEnd = "store" | "gateway";

/** A gateway renews its own lease in the registry every 5 seconds. */
export const LEASE_RENEW_SECONDS = 5;
/** The largest number of pings a second on the rail, to scale the bars. */
export const BAR_MAX = OPEN_LINES / GAP_STEPS[0];

export type Presence = {
  gap: number;
  end: PingEnd;
  pingsPerSecond: number;
  timesMessages: number;
  offlineAfter: number;
  storeWrites: number;
};

export function presenceRun(gap: number, end: PingEnd): Presence {
  const pingsPerSecond = OPEN_LINES / gap;
  return {
    gap,
    end,
    pingsPerSecond,
    timesMessages: pingsPerSecond / PEAK_MESSAGES,
    offlineAfter: 2 * gap,
    storeWrites: end === "store" ? pingsPerSecond : PRESENCE_CHANGES + GATEWAYS / LEASE_RENEW_SECONDS,
  };
}

export type Verdict = { text: string; tone: Tone };

/** At most 38 characters. */
export function presenceVerdict(p: Presence): Verdict {
  const n = Math.round(p.timesMessages);
  if (p.end === "store" && p.timesMessages >= 3) return { text: `Pings are ${n}x the message rate`, tone: "bad" };
  if (p.end === "gateway" && p.gap === 120) return { text: "Cheap, but a dot 4 minutes late", tone: "warn" };
  if (p.end === "gateway") return { text: "Cheap: store sees only changes", tone: "good" };
  return { text: "Pings below 2x the message rate", tone: "warn" };
}

/** Share of the presence store's plan one node carries (the registry node plan, 50,000 a second). */
export function storeTone(writes: number): Tone {
  const times = writes / REGISTRY_PLAN;
  return times > 1 ? "bad" : times >= 0.5 ? "warn" : "good";
}

export const gapText = (s: number) => (s >= 60 ? `${s / 60} min` : `${s} s`);
export const secondsLabel = (s: number) => `${s} s`;

/** "7.2" for 7.2, "43" for 43.2: one decimal under 10. */
export const timesText = (x: number) => (x >= 10 ? String(Math.round(x)) : (Math.round(x * 10) / 10).toFixed(1));

export const perSecond = (n: number) => `${withCommas(n)} /s`;

/** What the store takes, as the picture writes it: exact for pings, "~3,125 /s" for the status changes (the 12 lease renewals a second are left out). */
export const storeWritesText = (p: Presence) => (p.end === "store" ? perSecond(p.storeWrites) : `~${withCommas(PRESENCE_CHANGES)} /s`);

/** The state in one sentence, for a control's value text. */
export function presenceValueText(p: Presence): string {
  const where = p.end === "store" ? "each ping is written to the store" : "each ping ends at the gateway, the store sees only changes";
  return `ping every ${p.gap} seconds, ${withCommas(p.pingsPerSecond)} pings a second, ${timesText(p.timesMessages)} times the message rate, offline shown after ${p.offlineAfter} seconds, ${where}, store writes ${p.end === "store" ? "" : "about "}${withCommas(p.end === "store" ? p.storeWrites : PRESENCE_CHANGES)} a second`;
}

/** Dots a second for a rate: slow for the thin stream of changes, fast for 600,000 pings, never more than 9. */
export function dotsPerSecond(rate: number): number {
  if (!(rate > 0)) return 0;
  return Math.min(9, 0.4 + 5.5 * Math.pow(Math.min(1, rate / BAR_MAX), 0.6));
}
