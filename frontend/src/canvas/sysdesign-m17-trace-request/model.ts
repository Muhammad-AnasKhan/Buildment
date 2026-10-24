// 17.2 beat 4: a trace as a waterfall. Each span has a service, a name, a
// start and an end in ms, and a parent. Self time = duration minus the time
// covered by its children; share = self time / trace total. All figures are
// course numbers (the made-up delivery app Souq Express). Pure, no React.

import type { Tone } from "../primitives/tones";

export type Service = "api" | "menu" | "payments";
export type Order = "fast" | "slow";

export type Span = {
  service: Service;
  name: string;
  start: number;
  end: number;
  /** Row index of the parent, or null for the root. */
  parent: number | null;
  depth: number;
};

const SHAPE: readonly { service: Service; name: string; parent: number | null; depth: number }[] = [
  { service: "api", name: "GET /order", parent: null, depth: 0 },
  { service: "api", name: "call menu", parent: 0, depth: 1 },
  { service: "menu", name: "GET /menu", parent: 1, depth: 2 },
  { service: "menu", name: "SELECT items", parent: 2, depth: 3 },
  { service: "api", name: "call payments", parent: 0, depth: 1 },
  { service: "payments", name: "GET /payments", parent: 4, depth: 2 },
  { service: "payments", name: "provider.charge", parent: 5, depth: 3 },
];

const TIMES: Record<Order, readonly (readonly [number, number])[]> = {
  slow: [[0, 780], [0, 18], [2, 16], [2, 14], [20, 775], [22, 772], [24, 766]],
  fast: [[0, 95], [0, 17], [2, 15], [2, 13], [18, 93], [20, 91], [22, 88]],
};

export const ORDERS: readonly { id: Order; label: string }[] = [
  { id: "fast", label: "Fast order" },
  { id: "slow", label: "Slow order" },
];

export const SERVICES: readonly Service[] = ["api", "menu", "payments"];
export const SLOW_ROW = 6; // provider.charge

export function spans(order: Order): Span[] {
  return SHAPE.map((s, i) => ({ ...s, start: TIMES[order][i][0], end: TIMES[order][i][1] }));
}

export const total = (order: Order) => spans(order)[0].end;
export const duration = (s: Span) => s.end - s.start;

/** Time covered by the children of row i (children never overlap in this trace). */
export function childTime(order: Order, i: number): number {
  return spans(order)
    .filter((s) => s.parent === i)
    .reduce((sum, s) => sum + duration(s), 0);
}

export function selfTime(order: Order, i: number): number {
  const all = spans(order);
  return duration(all[i]) - childTime(order, i);
}

/** Share of the whole trace that is this span's own time, 0 to 1. */
export const share = (order: Order, i: number) => selfTime(order, i) / total(order);

export const percent = (order: Order, i: number) => Math.round(share(order, i) * 100);

export type Verdict = { text: string; tone: Tone };

/** The banner: nothing selected, a small span, or the span that holds the time. */
export function verdictFor(order: Order, selected: number | null): Verdict {
  if (selected === null) return { text: "Tap the span that holds the time", tone: "accent" };
  const self = selfTime(order, selected);
  const sh = share(order, selected);
  if (sh < 0.5) return { text: `Only ${self} of ${total(order)} ms are here`, tone: "warn" };
  if (order === "fast") return { text: `${percent(order, selected)}% of ${total(order)} ms, and that is normal`, tone: "good" };
  return { text: `${percent(order, selected)}% of the wait is in this call`, tone: "good" };
}

export function rowLabel(order: Order, i: number): string {
  const s = spans(order)[i];
  return `${s.service} ${s.name}, starts ${s.start} ms, lasts ${duration(s)} ms, own time ${selfTime(order, i)} ms, ${percent(order, i)} percent of the order`;
}

/** The next row for an arrow key, or null for other keys. */
export function moveRow(from: number | null, key: string, rows = SHAPE.length): number | null {
  const last = rows - 1;
  const at = from ?? -1;
  switch (key) {
    case "ArrowDown":
    case "ArrowRight":
      return Math.min(last, at + 1);
    case "ArrowUp":
    case "ArrowLeft":
      return Math.max(0, at <= 0 ? 0 : at - 1);
    case "Home":
      return 0;
    case "End":
      return last;
    default:
      return null;
  }
}
