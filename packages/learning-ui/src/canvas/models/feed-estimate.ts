import { flowRate, formatBytes, sig3 } from "./envelope-estimate";
import { BYTES_PER_ID, IDS_PER_TIMELINE, PEAK_FACTOR, POSTS_PER_USER, SECONDS_PER_DAY } from "./feed-numbers";
import { withCommas } from "./picture-controls";

// 21.1 "Drag the volume, find the driver". Hikaya's estimate as three chains of
// small multiplications from one card (the method of chapter 2.3). Pure
// functions, no React.
//
//   feed opens a day     = daily users x opens per user
//   feed opens a second  = opens a day / 86,400, peak = average x 3
//   posts a day          = daily users x 0.2, a second and peak the same way
//   lookups a second     = peak feed opens x follows (if each open builds its own list)
//   timeline storage     = daily users x 800 ids x 8 bytes
//   reads per post       = opens per user / 0.2

export const USER_STEPS = [10_000_000, 25_000_000, 50_000_000, 100_000_000] as const;
export const OPEN_STEPS = [1, 2, 5, 10, 20] as const;
export const FOLLOW_STEPS = [50, 150, 500] as const;

/** At or above this many lookups a second, building each feed on read is out of reach. */
export const LOOKUPS_MATTER = 100_000;
/** At or above this many reads for each post, build the list ahead. */
export const READS_AHEAD = 25;
/** At or above this many reads for each post, building ahead pays. */
export const READS_LEAD = 10;

export type FeedInputs = { users: number; opens: number; follows: number };

export type FeedEstimate = {
  opensPerDay: number;
  opensAverage: number;
  opensPeak: number;
  postsPerDay: number;
  postsAverage: number;
  postsPeak: number;
  lookupsPeak: number;
  storageBytes: number;
  readsPerPost: number;
};

export function feedEstimate(i: FeedInputs): FeedEstimate {
  const opensPerDay = i.users * i.opens;
  const opensAverage = opensPerDay / SECONDS_PER_DAY;
  const postsPerDay = i.users * POSTS_PER_USER;
  const postsAverage = postsPerDay / SECONDS_PER_DAY;
  return {
    opensPerDay,
    opensAverage,
    opensPeak: opensAverage * PEAK_FACTOR,
    postsPerDay,
    postsAverage,
    postsPeak: postsAverage * PEAK_FACTOR,
    lookupsPeak: opensAverage * PEAK_FACTOR * i.follows,
    storageBytes: i.users * IDS_PER_TIMELINE * BYTES_PER_ID,
    // Rounded so 5 / 0.2 is exactly 25 and the thresholds do not flicker.
    readsPerPost: Math.round((i.opens / POSTS_PER_USER) * 1e6) / 1e6,
  };
}

/** A rate on a card: "347 /s", "17,361 /s", "2.6M /s". */
export function perSecondText(n: number): string {
  const v = Number.isFinite(n) ? Math.max(0, n) : 0;
  if (v >= 1e6) return `${sig3(v / 1e6)}M /s`;
  return `${withCommas(Math.round(v))} /s`;
}

/** A rate in words for a screen reader: "17,361", "2.6 million". */
export function rateInWords(n: number): string {
  const v = Number.isFinite(n) ? Math.max(0, n) : 0;
  if (v >= 1e6) return `${sig3(v / 1e6)} million`;
  return withCommas(Math.round(v));
}

export function bytesInWords(n: number): string {
  return formatBytes(n).replace(" TB", " terabytes").replace(" GB", " gigabytes").replace(" PB", " petabytes").replace(" MB", " megabytes");
}

export type Ring = "lookups" | "opens" | "none";

/** The card with the biggest consequence: the lookups first, then the peak feed opens, else none. */
export function ring(r: FeedEstimate): Ring {
  if (r.lookupsPeak >= LOOKUPS_MATTER) return "lookups";
  if (r.readsPerPost >= READS_AHEAD) return "opens";
  return "none";
}

export type Verdict = { text: string; tone: "good" | "warn" };

/** At most 38 characters. */
export function feedVerdict(r: FeedEstimate): Verdict {
  if (r.readsPerPost >= READS_AHEAD) return { text: "Reads dwarf posts: build ahead", tone: "warn" };
  if (r.readsPerPost >= READS_LEAD) return { text: "Reads lead: building ahead pays", tone: "warn" };
  return { text: "Close: building on read could work", tone: "good" };
}

/** The result in one sentence, for a slider's value text. */
export function feedTail(r: FeedEstimate): string {
  return `${rateInWords(r.opensPeak)} feed opens a second at peak, ${rateInWords(r.postsPeak)} posts a second, ${rateInWords(r.lookupsPeak)} lookups a second if built on read`;
}


/**
 * Dots a second on each link, set by the value the link leads to: rates
 * against 5,000 a second (one app server's plan), storage against 1 TB.
 */
export function chainRates(r: FeedEstimate) {
  return {
    opensDay: flowRate(r.opensPeak / 5_000),
    opensAverage: flowRate(r.opensAverage / 5_000),
    opensPeak: flowRate(r.opensPeak / 5_000),
    lookups: flowRate(r.lookupsPeak / 5_000),
    postsDay: flowRate(r.postsAverage / 5_000),
    postsAverage: flowRate(r.postsAverage / 5_000),
    postsPeak: flowRate(r.postsPeak / 5_000),
    storage: flowRate(r.storageBytes / 1e12),
  };
}
