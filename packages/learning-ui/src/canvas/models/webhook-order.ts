// 25.4 "Duplicate, late, out of order". Three events happen in order
// (authorized, captured, refunded) but arrive in any order, and sometimes one
// arrives twice. Two rules turn arrivals into a status. Pure functions.

export type EventKey = "A" | "C" | "R";
export type State = "created" | "authorized" | "captured" | "refunded";

export const STATES: readonly State[] = ["created", "authorized", "captured", "refunded"];
export const RANK: Record<State, number> = { created: 0, authorized: 1, captured: 2, refunded: 3 };
export const EVENT_STATE: Record<EventKey, State> = { A: "authorized", C: "captured", R: "refunded" };
export const TRUTH: State = "refunded";

/** The six arrival orders, in rail order. The rail value is the index. */
export const ORDERS: readonly (readonly EventKey[])[] = [
  ["A", "C", "R"],
  ["A", "R", "C"],
  ["C", "A", "R"],
  ["C", "R", "A"],
  ["R", "A", "C"],
  ["R", "C", "A"],
];
export const ORDER_STOPS = [0, 1, 2, 3, 4, 5] as const;
export const DEFAULT_ORDER = 2;

/** "A C R". */
export const orderLabel = (i: number) => ORDERS[i].join(" ");

/** The arrivals for an order, with a second captured event at the end if asked. */
export function arrivals(order: number, duplicate: boolean): EventKey[] {
  const base = [...ORDERS[Math.max(0, Math.min(ORDERS.length - 1, order))]];
  return duplicate ? [...base, "C"] : base;
}

export type Step = {
  event: EventKey;
  /** The status after this arrival. */
  state: State;
  /** True when the rule left the status alone: the event would not move it forward. */
  ignored: boolean;
};

/** Last event wins: the status is the state of whatever arrived last. */
export function lastWins(seq: readonly EventKey[]): Step[] {
  return seq.map((event) => ({ event, state: EVENT_STATE[event], ignored: false }));
}

/** Forward only: move up in rank, ignore anything that would not. The event is still saved. */
export function forwardOnly(seq: readonly EventKey[]): Step[] {
  let current: State = "created";
  return seq.map((event) => {
    const next = EVENT_STATE[event];
    if (RANK[next] > RANK[current]) {
      current = next;
      return { event, state: current, ignored: false };
    }
    return { event, state: current, ignored: true };
  });
}

export const finalState = (steps: readonly Step[]): State => (steps.length ? steps[steps.length - 1].state : "created");

export type OrderResult = {
  seq: EventKey[];
  last: Step[];
  forward: Step[];
  lastFinal: State;
  forwardFinal: State;
};

export function runOrder(order: number, duplicate: boolean): OrderResult {
  const seq = arrivals(order, duplicate);
  const last = lastWins(seq);
  const forward = forwardOnly(seq);
  return { seq, last, forward, lastFinal: finalState(last), forwardFinal: finalState(forward) };
}

export type OrderVerdict = { text: string; tone: "good" | "bad" };

/** At most 38 characters. */
export function orderVerdict(r: OrderResult): OrderVerdict {
  if (r.lastFinal === TRUTH && r.forwardFinal === TRUTH) return { text: "Both end on refunded", tone: "good" };
  if (r.lastFinal !== TRUTH) return { text: `Last wins: ${r.lastFinal}. Truth: ${TRUTH}`, tone: "bad" };
  return { text: `Forward: ${r.forwardFinal}. Truth: ${TRUTH}`, tone: "bad" };
}

export function orderValueText(r: OrderResult, duplicate: boolean): string {
  const names = r.seq.map((e) => EVENT_STATE[e]).join(", ");
  return `Arrival order ${names}${duplicate ? ", captured arrives twice" : ""}; last event wins ends on ${r.lastFinal}; forward only ends on ${r.forwardFinal}`;
}

/**
 * Where the marker is for a clock in seconds: 0 is "created", k is the status
 * after the kth arrival. It visits each in turn, then rests on the last one
 * before the loop starts again.
 */
export function markerStep(seconds: number, count: number, perStep = 0.9, rest = 2.2): number {
  const loop = (count + 1) * perStep + rest;
  const t = ((seconds % loop) + loop) % loop;
  return Math.min(count, Math.floor(t / perStep));
}
