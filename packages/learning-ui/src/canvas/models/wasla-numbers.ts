// Course numbers for Wasla (the made-up link shortener of module 20), in one
// place so the four playables of the module and the watch-only scenes agree.
// Defined in chapters 20.1, 20.2 and 20.4. Plain data, no React.

/** A month is 30 days of 86,400 seconds. */
export const SECONDS_PER_MONTH = 2_592_000;
/** The busiest second is this many times the average. */
export const PEAK_FACTOR = 5;
/** Bytes stored for one link. */
export const BYTES_PER_LINK = 300;
/** Course default: new links a month. */
export const DEFAULT_NEW_LINKS = 500_000_000;
/** Course default: redirects for each link created. */
export const DEFAULT_READS_PER_LINK = 100;
/** Course default: years a link is kept. */
export const DEFAULT_YEARS = 5;
/** Creates a second on average (500 million / 2,592,000, rounded as the chapters do). */
export const CREATES_PER_SECOND = 193;

/** Peak load of the design: redirects and creates a second. */
export const PEAK_REDIRECTS = 100_000;
export const PEAK_CREATES = 1_000;
/** An app server finishes 10,000 redirects a second and is planned at half. */
export const APP_PLAN = 5_000;
/** A database node finishes 5,000 operations a second and is planned at half. */
export const NODE_PLAN = 2_500;

/** Milliseconds at the redirect service for a cache hit and for a miss. */
export const HIT_MS = 0.55;
export const MISS_MS = 3.05;
