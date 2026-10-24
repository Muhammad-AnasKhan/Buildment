import { withCommas } from "./picture-controls";
import { flowRate, formatBytes, sig3 } from "./envelope-estimate";
import { BYTES_PER_LINK, PEAK_FACTOR, SECONDS_PER_MONTH } from "./wasla-numbers";

// 20.1 "Drag the volume, find the load". Wasla's estimate as a chain of small
// multiplications (the method of chapter 2.3). Pure functions, no React.
//
//   creates a second  = new links a month / 2,592,000
//   redirects average = creates x reads per link
//   redirects peak    = average x 5
//   links stored      = new links a month x 12 x years
//   storage           = links stored x 300 bytes

export const NEW_LINK_STEPS = [100_000_000, 200_000_000, 500_000_000, 1_000_000_000, 2_000_000_000] as const;
export const READ_STEPS = [10, 50, 100, 200, 1_000] as const;
export const YEAR_STEPS = [1, 2, 5, 10] as const;

/** At or above this many redirects a second at peak, reads are the driver. */
export const PEAK_MATTERS = 2_500;
/** At or above this many redirects a second at peak, a cache is not optional. */
export const PEAK_MUST = 50_000;
/** At or above this many bytes, storage is the driver when reads are small. */
export const STORAGE_MATTERS = 5e12;

export type WaslaInputs = { newLinks: number; reads: number; years: number };

export type WaslaEstimate = {
  createsPerSecond: number;
  averagePerSecond: number;
  peakPerSecond: number;
  linksStored: number;
  storageBytes: number;
};

export function waslaEstimate(i: WaslaInputs): WaslaEstimate {
  const createsPerSecond = i.newLinks / SECONDS_PER_MONTH;
  const averagePerSecond = createsPerSecond * i.reads;
  const linksStored = i.newLinks * 12 * i.years;
  return {
    createsPerSecond,
    averagePerSecond,
    peakPerSecond: averagePerSecond * PEAK_FACTOR,
    linksStored,
    storageBytes: linksStored * BYTES_PER_LINK,
  };
}

/** A rate with its unit: "193 /s", "19,300 /s", "96,500 /s". */
export const perSecond = (n: number) => `${sig3(n)} /s`;

/** Bytes in words for a screen reader: "9 terabytes". */
export function bytesInWords(n: number): string {
  return formatBytes(n)
    .replace(" TB", " terabytes")
    .replace(" GB", " gigabytes")
    .replace(" PB", " petabytes")
    .replace(" MB", " megabytes");
}

export type Driver = "peak" | "storage" | "none";

/** The card with the biggest consequence: reads first, then storage, else none. */
export function driver(r: WaslaEstimate): Driver {
  if (r.peakPerSecond >= PEAK_MATTERS) return "peak";
  if (r.storageBytes >= STORAGE_MATTERS) return "storage";
  return "none";
}

export type Verdict = { text: string; tone: "good" | "warn" };

/** At most 38 characters. */
export function estimateVerdict(r: WaslaEstimate): Verdict {
  if (r.peakPerSecond >= PEAK_MUST) return { text: "Reads drive it: a cache is a must", tone: "warn" };
  if (r.peakPerSecond >= PEAK_MATTERS) return { text: "Reads matter: a cache helps a lot", tone: "warn" };
  if (r.storageBytes >= STORAGE_MATTERS) return { text: "Storage drives it: spread the data", tone: "warn" };
  return { text: "One database could serve this", tone: "good" };
}

/** The result in one sentence, with exact peak reads, for a slider's value text. */
export function estimateTail(r: WaslaEstimate): string {
  return `${sig3(r.createsPerSecond)} creates a second, ${withCommas(r.peakPerSecond)} redirects a second at peak, ${bytesInWords(r.storageBytes)}`;
}

export const yearsText = (n: number) => `${n} ${n === 1 ? "year" : "years"}`;

/**
 * Dots a second on each link, set by the value the link leads to, against what
 * one app server plans for (5,000 a second) or the 5 TB mark.
 */
export function chainRates(r: WaslaEstimate) {
  return {
    creates: flowRate(r.createsPerSecond / 5_000),
    average: flowRate(r.averagePerSecond / 5_000),
    peak: flowRate(r.peakPerSecond / 5_000),
    storage: flowRate(r.storageBytes / STORAGE_MATTERS),
  };
}
