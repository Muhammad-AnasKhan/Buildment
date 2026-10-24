import { flowRate, formatCount, sig3 } from "./envelope-estimate";
import { withCommas } from "./picture-controls";

// 25.1 "Drag the crowd, find the pain". Tazkara's ticket drop as three short
// chains of arithmetic (the method of chapter 2.3). Pure functions, no React.
//
//   fans in the first 10 s     = fans x 50%
//   fans a second at the start = that / 10
//   requests a second, peak    = fans a second x 4
//   fans per seat              = fans / seats
//   hold attempts in 10 s      = fans x 50% (one hold each)
//   share that must fail       = max(0, 1 - seats / attempts)
//   payments a second          = seats / 120
//   money moved in 2 minutes   = seats x 80

export const FAN_STEPS = [100_000, 200_000, 400_000, 1_000_000] as const;
export const SEAT_STEPS = [5_000, 20_000, 50_000] as const;
export const DEFAULT_FANS = 400_000;
export const DEFAULT_SEATS = 20_000;

/** Course assumptions, shared with chapters 25.1 and 25.2. */
export const FIRST_SHARE_PERCENT = 50;
export const FIRST_SECONDS = 10;
export const REQUESTS_PER_FAN = 4;
export const HOLDS_PER_FAN = 1;
export const CHECKOUT_SECONDS = 120;
export const TICKET_PRICE = 80;
/** The seat store is planned for this many requests a second. */
export const STORE_PLAN = 5_000;

/** At or above this share of failed holds, contention is the headline. */
export const CONTENTION_PERCENT = 50;

export type DropInputs = { fans: number; seats: number };

export type DropEstimate = {
  fansFirst: number;
  fansPerSecond: number;
  requestsPerSecond: number;
  fansPerSeat: number;
  attempts: number;
  /** 0 to 100, exact (not rounded). */
  failPercent: number;
  paymentsPerSecond: number;
  moneyMoved: number;
};

const pos = (n: number) => (Number.isFinite(n) ? Math.max(0, n) : 0);

export function estimateDrop(i: DropInputs): DropEstimate {
  const fans = pos(i.fans);
  const seats = pos(i.seats);
  const fansFirst = (fans * FIRST_SHARE_PERCENT) / 100;
  const attempts = fansFirst * HOLDS_PER_FAN;
  return {
    fansFirst,
    fansPerSecond: fansFirst / FIRST_SECONDS,
    requestsPerSecond: (fansFirst / FIRST_SECONDS) * REQUESTS_PER_FAN,
    fansPerSeat: seats > 0 ? fans / seats : 0,
    attempts,
    failPercent: attempts > 0 ? Math.max(0, ((attempts - seats) * 100) / attempts) : 0,
    paymentsPerSecond: seats / CHECKOUT_SECONDS,
    moneyMoved: seats * TICKET_PRICE,
  };
}

/** The card that carries the lesson: the failed share when it is a half or more, else payments. */
export type DropRing = "failed" | "payments";

export function dropRing(r: DropEstimate): DropRing {
  return r.failPercent >= CONTENTION_PERCENT ? "failed" : "payments";
}

export type DropVerdict = { text: string; tone: "good" | "warn" };

/** At most 38 characters. */
export function dropVerdict(r: DropEstimate): DropVerdict {
  const n = Math.round(r.failPercent);
  if (r.failPercent >= CONTENTION_PERCENT) return { text: `Contention: ${n}% of holds must fail`, tone: "warn" };
  if (r.failPercent > 0) return { text: `Some contention: ${n}% of holds fail`, tone: "good" };
  return { text: "Every hold can succeed", tone: "good" };
}

/** A rate with its unit: "80,000 /s", "167 /s". */
export const perSecond = (n: number) => `${sig3(n)} /s`;

/** "20 per seat", "2 per seat". */
export const perSeat = (n: number) => `${sig3(n)} per seat`;

/** "90%" (whole percent, as the verdict says it). */
export const percentText = (n: number) => `${Math.round(pos(n))}%`;

/** Money in words: "400,000", "1.6 million", "4 million". */
export const moneyText = (n: number) => formatCount(n);

/** The result in one sentence, for a slider's value text. */
export function dropTail(i: DropInputs, r: DropEstimate): string {
  return `${withCommas(i.fans)} fans, ${withCommas(i.seats)} seats, ${withCommas(r.requestsPerSecond)} requests a second at peak, ${sig3(r.fansPerSeat)} fans per seat, ${Math.round(r.failPercent)} percent of holds must fail, ${sig3(r.paymentsPerSecond)} payments a second`;
}

/**
 * Dots a second on each link, set by the value the link leads to: request
 * rates against the seat store's plan, fans per seat against 1, the failed
 * share against a half, payments against the plan, money against the default.
 */
export function dropRates(r: DropEstimate) {
  return {
    fansPerSecond: flowRate(r.fansPerSecond / STORE_PLAN),
    requests: flowRate(r.requestsPerSecond / STORE_PLAN),
    fansPerSeat: flowRate(r.fansPerSeat),
    failed: flowRate(r.failPercent / CONTENTION_PERCENT),
    payments: flowRate(r.paymentsPerSecond / STORE_PLAN),
    money: flowRate(r.moneyMoved / (DEFAULT_SEATS * TICKET_PRICE)),
  };
}
