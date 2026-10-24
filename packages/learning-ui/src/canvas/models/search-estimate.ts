import { withCommas } from "./picture-controls";
import { flowRate, formatCount, sig3 } from "./envelope-estimate";

// 23.1 "Drag the shoppers, find the load". Dalil's search estimate as chains of
// small multiplications (the method of chapter 2.3). Pure functions, no React.
//
//   searches a day            = shoppers x searches each
//   searches a second, peak   = searches a day / 86,400 x 3
//   suggestion calls a day    = searches a day x calls each
//   suggestion calls, peak    = suggestion calls a day / 86,400 x 3
//   index size                = products x 100 words x 4 bytes
//   shards                    = max(1, ceil(index GB / 10))

/** Course numbers of module 23 (chapter 23.1). They are assumptions. */
export const SECONDS_PER_DAY = 86_400;
export const PEAK_FACTOR = 3;
export const WORDS_PER_PRODUCT = 100;
export const BYTES_PER_ENTRY = 4;
export const SHARD_GB = 10;

export const SHOPPER_STEPS = [10_000_000, 25_000_000, 50_000_000, 100_000_000, 200_000_000] as const;
export const SEARCH_STEPS = [1, 2, 4, 8] as const;
export const CALL_STEPS = [1, 2, 3, 5, 8] as const;
export const PRODUCT_STEPS = [20_000_000, 50_000_000, 200_000_000, 500_000_000, 1_000_000_000] as const;

export const DEFAULT_SHOPPERS = 50_000_000;
export const DEFAULT_SEARCHES = 4;
export const DEFAULT_CALLS = 5;
export const DEFAULT_PRODUCTS = 200_000_000;

/** A card is ringed at or above these marks. */
export const SUGGEST_RING = 10_000;
export const SHARD_RING = 4;

export type SearchInputs = { shoppers: number; searches: number; calls: number; products: number };

export type SearchEstimate = {
  searchesPerDay: number;
  searchPeak: number;
  callsPerDay: number;
  suggestPeak: number;
  indexGb: number;
  shards: number;
  /** Search requests a second at peak that reach every shard. */
  shardCallsPeak: number;
};

export function searchEstimate(i: SearchInputs): SearchEstimate {
  const searchesPerDay = i.shoppers * i.searches;
  const callsPerDay = searchesPerDay * i.calls;
  const indexGb = (i.products * WORDS_PER_PRODUCT * BYTES_PER_ENTRY) / 1e9;
  const shards = Math.max(1, Math.ceil(indexGb / SHARD_GB));
  const searchPeak = (searchesPerDay / SECONDS_PER_DAY) * PEAK_FACTOR;
  return {
    searchesPerDay,
    searchPeak,
    callsPerDay,
    suggestPeak: (callsPerDay / SECONDS_PER_DAY) * PEAK_FACTOR,
    indexGb,
    shards,
    shardCallsPeak: searchPeak * shards,
  };
}

export const defaultInputs = (): SearchInputs => ({ shoppers: DEFAULT_SHOPPERS, searches: DEFAULT_SEARCHES, calls: DEFAULT_CALLS, products: DEFAULT_PRODUCTS });

/** A rate with its unit and exact digits: "6,944 /s". */
export const perSecond = (n: number) => `${withCommas(n)} /s`;

/** Gigabytes with three significant figures: "8 GB", "80 GB", "400 GB". */
export const gbText = (gb: number) => `${sig3(gb)} GB`;

export const shardsText = (n: number) => `${n} ${n === 1 ? "shard" : "shards"}`;

export type Ring = { suggest: boolean; shards: boolean };

export function rings(r: SearchEstimate): Ring {
  return { suggest: r.suggestPeak >= SUGGEST_RING, shards: r.shards >= SHARD_RING };
}

export type Verdict = { text: string; tone: "good" | "warn" };

/** At most 38 characters. */
export function searchVerdict(r: SearchEstimate): Verdict {
  const ring = rings(r);
  if (ring.suggest && ring.shards) return { text: "Suggestions and index size drive it", tone: "warn" };
  if (ring.suggest) return { text: "Suggestions drive the traffic", tone: "warn" };
  if (ring.shards) return { text: "Index size drives: shard it", tone: "warn" };
  return { text: "One machine could serve this", tone: "good" };
}

/** The result in one sentence for a screen reader. */
export function searchTail(r: SearchEstimate): string {
  return `${withCommas(r.searchPeak)} searches a second at peak, ${withCommas(r.suggestPeak)} suggestion calls a second, ${gbText(r.indexGb)} index, ${shardsText(r.shards)}`;
}

export const shoppersText = (n: number) => `${formatCount(n)} shoppers a day`;

/** Dots a second on each link, set by the value the link leads to. */
export function searchRates(r: SearchEstimate) {
  return {
    searches: flowRate(r.searchesPerDay / 200_000_000),
    searchPeak: flowRate(r.searchPeak / 5_000),
    calls: flowRate(r.callsPerDay / 1_000_000_000),
    suggestPeak: flowRate(r.suggestPeak / 5_000),
    index: flowRate(r.indexGb / 80),
    shards: flowRate(r.shards / SHARD_RING),
  };
}
