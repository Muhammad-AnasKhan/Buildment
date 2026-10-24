// 15.7 beat 2: 20 orders arrive each second and three subscribers want to
// hear about each one. Email and Stats need 33.3 ms per event (30 a second);
// Receipts needs 1,000 / r ms. The order service has a pool of 5 workers. In
// the direct design a worker calls the three subscribers one after another and
// waits. In the queue design a worker only writes the event (5 ms) and each
// subscriber reads its own queue. Pure, no React.

import type { Tone } from "../primitives/tones";
import { withCommas } from "../models/picture-controls";

export const ORDERS_PER_S = 20;
export const FAST_MS = 1000 / 30;
export const POOL = 5;
export const WRITE_MS = 5;
export const WATCH_S = 600;

export const SPEEDS = [2, 4, 6, 10, 20, 30] as const;
export const DEFAULT_SPEED = 6;

export type Design = "direct" | "queues";

export type Direct = {
  speed: number;
  /** Time one order spends waiting for the three calls, in ms. */
  timeMs: number;
  /** Orders a second the pool of 5 can place. */
  capacity: number;
  /** Capacity is below the orders that arrive. */
  behind: boolean;
  /** Orders a second that reach each subscriber. */
  delivered: number;
  /** Orders waiting at the order service after 10 minutes. */
  waitingAfter: number;
};

export function direct(speed: number): Direct {
  const timeMs = FAST_MS + FAST_MS + 1000 / speed;
  const capacity = (POOL * 1000) / timeMs;
  const behind = capacity < ORDERS_PER_S;
  return { speed, timeMs, capacity, behind, delivered: Math.min(ORDERS_PER_S, capacity), waitingAfter: behind ? Math.round((ORDERS_PER_S - capacity) * WATCH_S) : 0 };
}

export type Queues = {
  speed: number;
  orderMs: number;
  /** Backlog of each subscriber's queue after 10 minutes. */
  email: number;
  stats: number;
  receipts: number;
};

export function queues(speed: number): Queues {
  const behind = (rate: number) => Math.max(0, ORDERS_PER_S - rate) * WATCH_S;
  return { speed, orderMs: WRITE_MS, email: behind(30), stats: behind(30), receipts: behind(speed) };
}

export type Verdict = { text: string; tone: Tone };

export function verdictFor(design: Design, speed: number): Verdict {
  if (design === "direct") {
    const d = direct(speed);
    if (d.behind) return { text: `Orders fall behind: only ${Math.round(d.capacity)} a second`, tone: "bad" };
    return { text: `Orders slow: ${Math.round(d.timeMs)} ms each`, tone: "warn" };
  }
  return queues(speed).receipts > 0 ? { text: "Orders fast; only Receipts waits", tone: "good" } : { text: "Everyone keeps up", tone: "good" };
}

export const oneDecimal = (v: number) => (Math.round(v * 10) / 10).toFixed(1);

export function valueText(design: Design, speed: number): string {
  if (design === "direct") {
    const d = direct(speed);
    return `Receipts handles ${speed} events a second, called in turn: an order takes ${Math.round(d.timeMs)} ms, the pool places ${oneDecimal(d.capacity)} orders a second${d.behind ? ", so orders fall behind" : ""}`;
  }
  const q = queues(speed);
  return `Receipts handles ${speed} events a second, with a queue for each: an order takes ${q.orderMs} ms, Receipts queue holds ${withCommas(q.receipts)} after 10 minutes`;
}

export const speedToFraction = (v: number) => (v - SPEEDS[0]) / (SPEEDS[SPEEDS.length - 1] - SPEEDS[0]);
