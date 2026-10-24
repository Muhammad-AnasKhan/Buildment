import { withCommas } from "./picture-controls";
import { flowRate, formatBytes, formatCount, sig3 } from "./envelope-estimate";

// 24.1 beat 2 "Drag the crowd, find the load". Safar's estimate as a chain of
// small multiplications (the method of chapter 2.3). Pure functions, no React.
//
//   reports a second    = drivers / seconds between reports
//   bandwidth in        = reports a second x 50 bytes
//   searches a second   = riders with the app open / 5
//   ride requests, peak = 10,000,000 / 86,400 x 5
//   latest places       = drivers x 100 bytes

export const DRIVER_STEPS = [100_000, 250_000, 500_000, 1_000_000, 2_000_000] as const;
export const GAP_STEPS = [1, 2, 4, 8, 15] as const;
export const RIDER_STEPS = [50_000, 100_000, 200_000, 500_000] as const;

export const DEFAULT_DRIVERS = 1_000_000;
export const DEFAULT_GAP = 4;
export const DEFAULT_RIDERS = 200_000;

/** Course assumptions of chapter 24.1, fixed in this picture. */
export const MAP_REFRESH_SECONDS = 5;
export const BYTES_PER_REPORT = 50;
export const BYTES_PER_DRIVER = 100;
export const RIDES_PER_DAY = 10_000_000;
export const SECONDS_PER_DAY = 86_400;
export const PEAK_FACTOR = 5;

/** At or above this many reports a second, updates are the driver. */
export const REPORTS_MATTER = 25_000;
/** At or above this many searches a second, searches are the driver when larger than the reports. */
export const SEARCHES_MATTER = 10_000;
/** Under this many a second one database node (chapter 20.2) could serve it. */
export const ONE_DATABASE = 2_500;

export type SafarInputs = { drivers: number; gap: number; riders: number };

export type SafarEstimate = {
  reportsPerSecond: number;
  bandwidthBytes: number;
  searchesPerSecond: number;
  requestsPerSecond: number;
  memoryBytes: number;
};

export function safarEstimate(i: SafarInputs): SafarEstimate {
  const reportsPerSecond = i.drivers / i.gap;
  return {
    reportsPerSecond,
    bandwidthBytes: reportsPerSecond * BYTES_PER_REPORT,
    searchesPerSecond: i.riders / MAP_REFRESH_SECONDS,
    requestsPerSecond: (RIDES_PER_DAY / SECONDS_PER_DAY) * PEAK_FACTOR,
    memoryBytes: i.drivers * BYTES_PER_DRIVER,
  };
}

/** A rate with its unit: "250,000 /s", "580 /s". */
export const perSecond = (n: number) => `${sig3(n)} /s`;

/** Bandwidth: "12.5 MB/s". */
export const bandwidthText = (bytes: number) => `${formatBytes(bytes)}/s`;

export type Driver = "reports" | "searches" | "none";

/** The card with the biggest consequence: reports when they lead, else searches, else none. */
export function driver(r: SafarEstimate): Driver {
  if (r.reportsPerSecond >= REPORTS_MATTER && r.reportsPerSecond >= r.searchesPerSecond) return "reports";
  if (r.searchesPerSecond > r.reportsPerSecond && r.searchesPerSecond >= SEARCHES_MATTER) return "searches";
  return "none";
}

export type Verdict = { text: string; tone: "good" | "warn" };

/** At most 38 characters. */
export function estimateVerdict(r: SafarEstimate): Verdict {
  const d = driver(r);
  if (d === "reports") return { text: "Updates drive it: keep them in memory", tone: "warn" };
  if (d === "searches") return { text: "Searches drive it: cache the map", tone: "warn" };
  if (r.reportsPerSecond < ONE_DATABASE && r.searchesPerSecond < ONE_DATABASE) return { text: "One database could serve this", tone: "good" };
  return { text: "Busy, but a few servers can do it", tone: "warn" };
}

export const gapText = (n: number) => `${n} ${n === 1 ? "second" : "seconds"}`;

/** The result in one sentence, for a slider's value text. */
export function estimateTail(r: SafarEstimate, i: SafarInputs): string {
  return `${formatCount(i.drivers)} drivers, a report every ${gapText(i.gap)}, ${withCommas(r.reportsPerSecond)} reports a second, ${withCommas(r.searchesPerSecond)} searches a second`;
}

/** Dots a second on each link, set by the value the link leads to. */
export function chainRates(r: SafarEstimate) {
  return {
    reports: flowRate(r.reportsPerSecond / 50_000),
    bandwidth: flowRate(r.bandwidthBytes / 12.5e6),
    searches: flowRate(r.searchesPerSecond / 50_000),
    requests: flowRate(r.requestsPerSecond / 50_000),
    memory: flowRate(r.memoryBytes / 100e6),
  };
}
