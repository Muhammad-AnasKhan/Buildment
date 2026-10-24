// Course numbers for DalilBot (the made-up web crawler of module 26), in one
// place so the five playables and the watch-only scenes agree. Defined in
// chapters 26.1 and 26.2. Plain data, no React.

/** A month is 30 days of 86,400 seconds. */
export const SECONDS_PER_MONTH = 2_592_000;
/** Pages fetched a month (the course default). */
export const DEFAULT_PAGES = 2_000_000_000;
/** KB of HTML in one page (1 KB = 1,000 bytes). */
export const DEFAULT_PAGE_KB = 100;
/** Seconds DalilBot waits between requests to one site (the course default). */
export const DEFAULT_WAIT = 1;
/** Links on one page. */
export const LINKS_PER_PAGE = 50;
/** Seconds for one fetch with a cold DNS lookup, and with a DNS cache. */
export const FETCH_SECONDS = 0.5;
export const FETCH_SECONDS_CACHED = 0.4;
/** Pages are stored compressed this many to 1. */
export const COMPRESSION = 4;
/** Downloads one fetcher machine holds in flight; it is planned at half its limit. */
export const SLOTS_PER_MACHINE = 100;
/** Seen set: URLs known, and the error rate of the Bloom filter in the design. */
export const SEEN_URLS = 20_000_000_000;
export const SEEN_ERROR = 0.01;
/** Pages a second in the course design (2 billion a month), unrounded. */
export const TARGET_PER_SECOND = DEFAULT_PAGES / SECONDS_PER_MONTH;
