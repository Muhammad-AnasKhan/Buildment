import { withCommas } from "./picture-controls";
import { TARGET_PER_SECOND } from "./crawl-numbers";

// 26.3 "Sites in play set the speed". The crawl speed is the smaller of two
// limits. Pure functions, no React.
//
//   politeness limit = sites with work waiting / wait        (pages a second)
//   capacity limit   = 800 download slots / 0.4 s = 2,000    (pages a second)
//   speed            = min(politeness limit, capacity limit)
//   sites needed     = 771.6 x wait                          (for the 772 pages a second target)
//   big site days    = 1,000,000 pages x wait / 86,400

export const SITE_STEPS = [10, 20, 50, 100, 300, 772, 1000, 3000, 10_000] as const;
export const WAIT_STEPS = [0.5, 1, 2, 5] as const;
export const SITES_DEFAULT = 20;
export const WAIT_DEFAULT = 1;

export const SLOTS = 800;
export const FETCH_SECONDS = 0.4;
export const CAPACITY = SLOTS / FETCH_SECONDS;
export const BIG_SITE_PAGES = 1_000_000;
export const TARGET = 772;
/** The most site icons drawn; "x N" says the true number. */
export const MAX_LANES = 24;

export type Limit = "sites" | "slots" | "both";

export type HostRate = {
  sites: number;
  wait: number;
  politeness: number;
  capacity: number;
  speed: number;
  limit: Limit;
  sitesNeeded: number;
  bigSiteDays: number;
};

export function hostRate(sites: number, wait: number): HostRate {
  const politeness = sites / wait;
  const speed = Math.min(politeness, CAPACITY);
  const limit: Limit = Math.abs(politeness - CAPACITY) < 1e-9 ? "both" : politeness < CAPACITY ? "sites" : "slots";
  return {
    sites,
    wait,
    politeness,
    capacity: CAPACITY,
    speed,
    limit,
    sitesNeeded: TARGET_PER_SECOND * wait,
    bigSiteDays: (BIG_SITE_PAGES * wait) / 86_400,
  };
}

export type Verdict = { text: string; tone: "good" | "warn" | "bad" };

/** At most 38 characters. */
export function hostVerdict(r: HostRate): Verdict {
  const n = withCommas(r.speed);
  if (r.limit !== "sites") return { text: `Slots are the limit: ${withCommas(CAPACITY)} a second`, tone: "good" };
  if (r.speed >= TARGET) return { text: `Enough sites: ${n} pages a second`, tone: "good" };
  if (r.speed >= TARGET / 2) return { text: `Short of 772: ${n} pages a second`, tone: "warn" };
  return { text: `Too few sites: ${n} pages a second`, tone: "bad" };
}

export const limitWord = (l: Limit) => (l === "sites" ? "sites" : l === "slots" ? "slots" : "both");

/** How many site icons to draw. */
export const lanesFor = (sites: number) => Math.min(MAX_LANES, Math.max(1, Math.round(sites)));

/** Days to finish the big site: "11.6 days", "5.8 days", "57.9 days". */
export function daysText(days: number): string {
  return `${Number(days.toFixed(1))} days`;
}

/** Position on a rail with the stops spaced evenly: 0 to 1. */
export const stopFraction = (steps: readonly number[], value: number) => {
  const i = steps.indexOf(value);
  return steps.length > 1 ? Math.max(0, i) / (steps.length - 1) : 0;
};

/**
 * Dots a second released by each drawn lane. One site releases a request each
 * wait; when sites outnumber the slots, the lanes slow in proportion.
 */
export function laneRate(r: HostRate): number {
  const perSite = 1 / r.wait;
  return r.politeness > r.capacity ? perSite * (r.capacity / r.politeness) : perSite;
}

/** Fill of the slots bar, 0 to 1, against 2,000 pages a second. */
export const slotsFill = (r: HostRate) => Math.max(0, Math.min(1, r.speed / r.capacity));

/** Value text for the sites rail. */
export function hostValueText(r: HostRate): string {
  const wait = r.wait === 1 ? "1 second" : `${r.wait} seconds`;
  return `${withCommas(r.sites)} sites, ${wait} wait, ${withCommas(r.speed)} pages a second, limited by ${limitWord(r.limit)}`;
}
