// 16.6 beat 2: six features on a screen, each depending on one service, each
// with a fallback chosen ahead of time. Break services and choose fallbacks;
// the customer can order only if nothing fails the page, the cart works, the
// shop list is live or cached, and payment is live or has another way. The
// fallbacks and tiers are a course design. Pure, no React.

import type { Tone } from "../primitives/tones";

export type Fallback = "fail" | "cached" | "default" | "hide" | "another";
export type Shown = "live" | "cached" | "default" | "hidden" | "another" | "fail";
export type Tier = "must work" | "should work" | "nice";

export type Feature = {
  id: string;
  name: string;
  /** Short service name, used in verdicts. */
  service: string;
  tier: Tier;
  /** Allowed fallbacks, in the order a tap cycles through them. The first is always "fail". */
  fallbacks: readonly Fallback[];
};

export const FEATURES: readonly Feature[] = [
  { id: "shop", name: "Shop list", service: "Catalog", tier: "must work", fallbacks: ["fail", "cached"] },
  { id: "cart", name: "Cart", service: "Cart", tier: "must work", fallbacks: ["fail"] },
  { id: "payment", name: "Payment", service: "Payments", tier: "must work", fallbacks: ["fail", "another"] },
  { id: "delivery", name: "Delivery estimate", service: "Routing", tier: "should work", fallbacks: ["fail", "default", "hide"] },
  { id: "picks", name: "Picks for you", service: "Picks", tier: "nice", fallbacks: ["fail", "hide", "cached"] },
  { id: "reviews", name: "Reviews", service: "Reviews", tier: "nice", fallbacks: ["fail", "hide", "cached"] },
];

const SHOP = 0;
const CART = 1;
const PAYMENT = 2;

/** What a fallback is called for each feature (the words on the card and for a screen reader). */
const NAMES: Record<string, Partial<Record<Fallback, { short: string; shown: string; spoken: string }>>> = {
  shop: { cached: { short: "cached copy", shown: "cached copy, 1 h old", spoken: "show a cached copy" } },
  payment: { another: { short: "cash on delivery", shown: "cash on delivery", spoken: "offer cash on delivery" } },
  delivery: { default: { short: "default range", shown: "default 30 to 45 min", spoken: "show a default range of 30 to 45 minutes" } },
  picks: { cached: { short: "cached popular", shown: "cached popular items", spoken: "show cached popular items" } },
  reviews: { cached: { short: "cached copy", shown: "cached copy", spoken: "show a cached copy" } },
};

const FALLBACK_SHOWN: Record<Fallback, Shown> = { fail: "fail", cached: "cached", default: "default", hide: "hidden", another: "another" };

export function fallbackShort(f: Feature, fb: Fallback): string {
  if (fb === "fail") return "fail the page";
  if (fb === "hide") return "hide it";
  return NAMES[f.id]?.[fb]?.short ?? fb;
}

export function fallbackSpoken(f: Feature, fb: Fallback): string {
  if (fb === "fail") return f.id === "cart" ? "none exists, the page fails" : "fail the page";
  if (fb === "hide") return "hide it";
  return NAMES[f.id]?.[fb]?.spoken ?? fb;
}

export type Choice = readonly number[];
export type Down = readonly boolean[];

export const START_CHOICE: Choice = FEATURES.map(() => 0);
export const START_DOWN: Down = FEATURES.map(() => false);

export type Card = { shown: Shown; text: string; tone: Tone | null };

export type Outcome = {
  cards: Card[];
  /** Indices of features whose service is down and whose fallback is "fail the page". */
  failed: number[];
  pageFails: boolean;
  canOrder: boolean;
  degraded: number;
  verdict: { text: string; tone: Tone };
};

export function fallbackOf(i: number, choice: Choice): Fallback {
  const f = FEATURES[i];
  return f.fallbacks[choice[i] % f.fallbacks.length];
}

export function evaluate(down: Down, choice: Choice): Outcome {
  const cards: Card[] = FEATURES.map((f, i) => {
    if (!down[i]) return { shown: "live", text: "live", tone: "good" };
    const fb = fallbackOf(i, choice);
    const shown = FALLBACK_SHOWN[fb];
    if (shown === "fail") return { shown, text: "page fails", tone: "bad" };
    if (shown === "hidden") return { shown, text: "hidden", tone: null };
    return { shown, text: NAMES[f.id]?.[fb]?.shown ?? shown, tone: "warn" };
  });
  const failed = FEATURES.map((_, i) => i).filter((i) => cards[i].shown === "fail");
  const pageFails = failed.length > 0;
  const degraded = cards.filter((c) => c.shown !== "live" && c.shown !== "fail").length;
  const cartDown = down[CART];
  const shopOk = cards[SHOP].shown === "live" || cards[SHOP].shown === "cached";
  const payOk = cards[PAYMENT].shown === "live" || cards[PAYMENT].shown === "another";
  const canOrder = !pageFails && !cartDown && shopOk && payOk;

  let verdict: Outcome["verdict"];
  if (cartDown) verdict = { text: "Cannot order: Cart is down", tone: "bad" };
  else if (pageFails) verdict = { text: `Page fails: ${FEATURES[failed[0]].service} is down`, tone: "bad" };
  else if (cards[PAYMENT].shown === "another") verdict = { text: "Orders work, cash on delivery only", tone: "warn" };
  else if (degraded > 0) verdict = { text: "Customer can still order", tone: "good" };
  else verdict = { text: "All features work", tone: "good" };
  return { cards, failed, pageFails, canOrder, degraded, verdict };
}

export const cycleChoice = (choice: Choice, i: number): Choice =>
  choice.map((c, k) => (k === i ? (c + 1) % FEATURES[i].fallbacks.length : c));

export const toggleService = (down: Down, i: number): Down => down.map((d, k) => (k === i ? !d : d));

export function featureLabel(i: number, down: Down, choice: Choice): string {
  const f = FEATURES[i];
  return `${f.name}, service ${down[i] ? "down" : "up"}, fallback: ${fallbackSpoken(f, fallbackOf(i, choice))}`;
}

export function serviceLabel(i: number, down: Down): string {
  const f = FEATURES[i];
  return down[i] ? `${f.service} service: down, press to fix it` : `${f.service} service: up, press to break it`;
}

/** The smallest set of fallbacks that lets the customer order with any one service but Cart down. */
export const SAFE_CHOICE: Choice = FEATURES.map((f) => {
  if (f.id === "shop") return f.fallbacks.indexOf("cached");
  if (f.id === "payment") return f.fallbacks.indexOf("another");
  if (f.id === "delivery") return f.fallbacks.indexOf("default");
  if (f.id === "picks" || f.id === "reviews") return f.fallbacks.indexOf("hide");
  return 0;
});
