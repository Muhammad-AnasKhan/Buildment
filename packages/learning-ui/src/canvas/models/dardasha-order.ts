import type { Tone } from "../primitives/tones";

// 22.4 "One counter per conversation sets the order". Two senders write at
// almost the same moment; the chat service numbers each message by arrival;
// one path to Sami is slow. Phones either sort by arrival or by number.
// Pure functions, no React, no random numbers.
//
//   each sender is 30 ms from the service, which is 40 ms from Layla
//   message 1 is sent at 0 ms, message 2 at 100 ms
//   Layla gets message 1 at 70 ms and message 2 at 170 ms
//   Sami gets message 1 at 30 + D ms (the slow path) and message 2 at 170 ms
//   by arrival Sami shows 2 before 1 when 30 + D > 170, that is D > 140
//   by number Sami holds message 2 until message 1 is in: a hold of D - 140 ms

export const DELAY_STEPS = [50, 100, 200, 500, 1000] as const;
export const DELAY_DEFAULT = 200;

export type Sender = "dana" | "omar";
export type Sort = "arrival" | "number";
export type PhoneId = "layla" | "sami";

export const SENDER_NAME: Record<Sender, string> = { dana: "Dana", omar: "Omar" };
/** What each person writes, as in the watch-only scene. */
export const SENDER_TEXT: Record<Sender, string> = { dana: "yes", omar: "no" };
export const other = (s: Sender): Sender => (s === "dana" ? "omar" : "dana");

export const SENDER_MS = 30;
export const LAYLA_MS = 40;
export const FAST_MS = 40;
export const GAP_MS = 100;
/** Delays at or below this keep Sami in the same order by arrival; above it they swap. */
export const TIE_MS = 140;

export type Msg = { n: 1 | 2; sender: Sender; sentAt: number; atService: number; atLayla: number; atSami: number };

export type OrderRun = { first: Sender; delay: number; msgs: Msg[] };

/** count is 1 while only the first sender has tapped Send, 2 once both have. */
export function orderRun(first: Sender, delay: number, count: 1 | 2 = 2): OrderRun {
  const m1: Msg = { n: 1, sender: first, sentAt: 0, atService: SENDER_MS, atLayla: SENDER_MS + LAYLA_MS, atSami: SENDER_MS + delay };
  const m2: Msg = { n: 2, sender: other(first), sentAt: GAP_MS, atService: GAP_MS + SENDER_MS, atLayla: GAP_MS + SENDER_MS + LAYLA_MS, atSami: GAP_MS + SENDER_MS + FAST_MS };
  return { first, delay, msgs: [m1, m2].slice(0, count) };
}

const arrivalOf = (m: Msg, phone: PhoneId) => (phone === "layla" ? m.atLayla : m.atSami);

export type Row = { n: 1 | 2; sender: Sender; state: "shown" | "held" };

/**
 * The two rows of a phone's list at sim time t (ms). By arrival, row i is the
 * i-th message to arrive. By number, row i is message i+1; a message that has
 * arrived before its predecessor is drawn "held" in its own row.
 */
export function phoneRows(run: OrderRun, phone: PhoneId, sort: Sort, t: number): [Row | null, Row | null] {
  const arrived = run.msgs.filter((m) => arrivalOf(m, phone) <= t);
  if (sort === "arrival") {
    const byTime = [...arrived].sort((a, b) => arrivalOf(a, phone) - arrivalOf(b, phone) || a.n - b.n);
    const row = (i: number): Row | null => (byTime[i] ? { n: byTime[i].n, sender: byTime[i].sender, state: "shown" } : null);
    return [row(0), row(1)];
  }
  const has1 = arrived.some((m) => m.n === 1);
  const row = (n: 1 | 2): Row | null => {
    const m = arrived.find((x) => x.n === n);
    if (!m) return null;
    return { n, sender: m.sender, state: n === 1 || has1 ? "shown" : "held" };
  };
  return [row(1), row(2)];
}

/** The numbers a phone shows, in order, once every message is in. */
export function finalOrder(run: OrderRun, phone: PhoneId, sort: Sort): number[] {
  const end = Math.max(...run.msgs.map((m) => arrivalOf(m, phone)));
  return phoneRows(run, phone, sort, end)
    .filter((r): r is Row => !!r && r.state === "shown")
    .map((r) => r.n);
}

export function phonesAgree(run: OrderRun, sort: Sort): boolean {
  const a = finalOrder(run, "layla", sort);
  const b = finalOrder(run, "sami", sort);
  return a.length === b.length && a.every((n, i) => n === b[i]);
}

/** Milliseconds message 2 waits at Sami's phone for message 1, in number mode. */
export function holdMs(run: OrderRun): number {
  const [m1, m2] = run.msgs;
  return m1 && m2 ? Math.max(0, m1.atSami - m2.atSami) : 0;
}

export type Verdict = { text: string; tone: Tone };

/** At most 38 characters. */
export function orderVerdict(run: OrderRun, sort: Sort): Verdict {
  if (sort === "number") return { text: "Same order on every phone", tone: "good" };
  return phonesAgree(run, "arrival") ? { text: "Same order, only by luck", tone: "warn" } : { text: "Phones disagree on the order", tone: "bad" };
}

/** When the last message lands, in ms. */
export function endMs(run: OrderRun): number {
  return Math.max(...run.msgs.flatMap((m) => [m.atLayla, m.atSami]));
}

/** One second of the picture is this many milliseconds of the story. */
export const MS_PER_SECOND = 200;
export const LEAD_SECONDS = 0.4;
export const REST_SECONDS = 2.4;

export function loopSeconds(run: OrderRun): number {
  return LEAD_SECONDS + endMs(run) / MS_PER_SECOND + REST_SECONDS;
}

/** Sim time (ms) at a clock reading: waits a moment, plays, rests on the finished picture, repeats. */
export function simAt(run: OrderRun, seconds: number): number {
  const phase = ((seconds % loopSeconds(run)) + loopSeconds(run)) % loopSeconds(run);
  return Math.max(0, (phase - LEAD_SECONDS) * MS_PER_SECOND);
}

export type Leg = { n: 1 | 2; sender: Sender; to: "service" | PhoneId; t0: number; t1: number };

/** Every hop a message makes, for drawing a dot in flight. */
export function legs(run: OrderRun): Leg[] {
  return run.msgs.flatMap((m): Leg[] => [
    { n: m.n, sender: m.sender, to: "service", t0: m.sentAt, t1: m.atService },
    { n: m.n, sender: m.sender, to: "layla", t0: m.atService, t1: m.atLayla },
    { n: m.n, sender: m.sender, to: "sami", t0: m.atService, t1: m.atSami },
  ]);
}

/** 0 to 1 along a leg at time t, or null when the message is not on that hop. */
export function legProgress(leg: Leg, t: number): number | null {
  if (t < leg.t0 || t > leg.t1) return null;
  return leg.t1 === leg.t0 ? 1 : (t - leg.t0) / (leg.t1 - leg.t0);
}

export const msText = (ms: number) => (ms >= 1000 ? `${ms / 1000} s` : `${ms} ms`);

const possessive = (s: Sender) => `${SENDER_NAME[s]}'s message`;

/** A phone's list in words: "Sami's phone shows: Omar's message, then Dana's". */
export function listText(run: OrderRun, phone: PhoneId, sort: Sort): string {
  const name = phone === "layla" ? "Layla" : "Sami";
  const order = finalOrder(run, phone, sort).map((n) => run.msgs[n - 1].sender);
  if (order.length < 2) return `${name}'s phone shows: ${order.map(possessive).join(", ") || "nothing yet"}`;
  return `${name}'s phone shows: ${possessive(order[0])}, then ${SENDER_NAME[order[1]]}'s`;
}
