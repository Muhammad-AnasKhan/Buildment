import { withCommas } from "./picture-controls";
import { flowRate, formatCount } from "./envelope-estimate";
import { COMPRESSION, FETCH_SECONDS, LINKS_PER_PAGE, SECONDS_PER_MONTH } from "./crawl-numbers";

// 26.1 "Drag the volume, find the load". DalilBot's estimate as a chain of
// small multiplications (the method of chapter 2.3). Pure functions, no React.
//
//   pages a second   = pages a month / 2,592,000
//   data in (Mbit/s) = pages a second x page KB x 8 / 1,000
//   sites busy       = pages a second x wait          (one request per site per wait)
//   fetches in flight= pages a second x 0.5           (Little's law, chapter 2.5)
//   link checks /s   = pages a second x 50
//   stored a month   = pages a month x page KB / 4 / 1e9   (TB)

export const PAGE_STEPS = [500_000_000, 1_000_000_000, 2_000_000_000, 5_000_000_000, 10_000_000_000] as const;
export const SIZE_STEPS = [20, 50, 100, 200, 500] as const;
export const WAIT_STEPS = [0.5, 1, 2, 5] as const;

/** At or above this many Mbit/s, bandwidth is the driver. */
export const BANDWIDTH_MATTERS = 5_000;
/** At or above this many sites busy at once, politeness is the driver. */
export const SITES_MATTER = 100;
/** At or above this many TB stored a month, storage is the driver. */
export const STORAGE_MATTERS_TB = 20;

export type CrawlInputs = { pages: number; sizeKb: number; wait: number };

export type CrawlEstimate = {
  perSecond: number;
  mbit: number;
  sites: number;
  inFlight: number;
  linkChecks: number;
  storedTb: number;
};

export function crawlEstimate(i: CrawlInputs): CrawlEstimate {
  const perSecond = i.pages / SECONDS_PER_MONTH;
  return {
    perSecond,
    mbit: (perSecond * i.sizeKb * 8) / 1000,
    sites: perSecond * i.wait,
    inFlight: perSecond * FETCH_SECONDS,
    linkChecks: perSecond * LINKS_PER_PAGE,
    storedTb: (i.pages * i.sizeKb) / COMPRESSION / 1e9,
  };
}

export type Driver = "bandwidth" | "sites" | "storage" | "none";

/** The card with the biggest consequence, in a fixed order. */
export function driver(r: CrawlEstimate): Driver {
  if (r.mbit >= BANDWIDTH_MATTERS) return "bandwidth";
  if (r.sites >= SITES_MATTER) return "sites";
  if (r.storedTb >= STORAGE_MATTERS_TB) return "storage";
  return "none";
}

export type Verdict = { text: string; tone: "good" | "warn" };

/** At most 38 characters. */
export function estimateVerdict(r: CrawlEstimate): Verdict {
  switch (driver(r)) {
    case "bandwidth":
      return { text: "Bandwidth drives it: spread the load", tone: "warn" };
    case "sites":
      return { text: "Politeness: need many sites at once", tone: "warn" };
    case "storage":
      return { text: "Storage drives it: plan the disks", tone: "warn" };
    default:
      return { text: "One machine could crawl this", tone: "good" };
  }
}

/** A rate with its unit and whole numbers: "772 /s", "38,580 /s". */
export const rate = (n: number) => `${withCommas(n)} /s`;
export const sitesText = (n: number) => `${withCommas(n)} ${Math.round(n) === 1 ? "site" : "sites"}`;
export const mbitText = (n: number) => `${withCommas(n)} Mbit/s`;

/** Terabytes with three significant figures: "2.5 TB", "12.5 TB", "50 TB", "1,250 TB". */
export function terabytes(tb: number): string {
  if (tb >= 1000) return `${withCommas(tb)} TB`;
  const text = tb.toPrecision(3);
  return `${text.includes(".") ? text.replace(/0+$/, "").replace(/\.$/, "") : text} TB`;
}

export const kbText = (n: number) => `${n} KB`;
export const waitText = (n: number) => `${n} ${n === 1 ? "second" : "seconds"}`;

/** The result in one sentence, for a slider's value text. */
export function estimateTail(r: CrawlEstimate): string {
  return `${withCommas(r.perSecond)} pages a second, ${withCommas(r.mbit)} megabits a second coming in, ${withCommas(r.sites)} sites busy at once, ${terabytes(r.storedTb).replace(" TB", " terabytes")} stored a month`;
}

export const pagesText = (n: number) => `${formatCount(n)} pages`;

/** Dots a second along each link, set by the value the link leads to. */
export function chainRates(r: CrawlEstimate) {
  return {
    perSecond: flowRate(r.perSecond / 1_000),
    sites: flowRate(r.sites / SITES_MATTER),
    mbit: flowRate(r.mbit / BANDWIDTH_MATTERS),
    inFlight: flowRate(r.inFlight / 500),
    linkChecks: flowRate(r.linkChecks / 50_000),
    stored: flowRate(r.storedTb / STORAGE_MATTERS_TB),
  };
}
