import { withCommas } from "./picture-controls";
import { flowRate, formatBits, formatBytes, formatCount, sig3 } from "./envelope-estimate";
import { MINUTES_PER_DAY, PEAK_FACTOR, SECONDS_PER_DAY, SENT_MBIT, STORED_MB_PER_VIDEO, WORKER_MINUTES_PER_VIDEO } from "./lamha-numbers";

// 27.1 "Drag the views, find the load". Lamha's estimate as three chains of
// small multiplications (the method of chapter 2.3, Little's law of 2.5).
// Pure functions, no React.
//
//   views a second   = views a day / 86,400
//   viewers at once  = views a second x minutes x 60
//   sent, average    = viewers at once x 2 Mbit/s;  peak = average x 3
//   stored a year    = uploads a day x 739 MB x 365
//   busy machines    = uploads a day x 15 / 1,440;  peak = average x 3

export const VIEW_STEPS = [100_000_000, 500_000_000, 1_000_000_000, 2_000_000_000, 5_000_000_000] as const;
export const MINUTE_STEPS = [1, 2, 3, 5, 10] as const;
export const UPLOAD_STEPS = [100_000, 250_000, 500_000, 1_000_000, 2_000_000] as const;

/** At or above this peak video sent (bit/s), bandwidth drives the design. */
export const SENT_MATTERS = 1e12;
/** At or above this many bytes stored a year, storage drives the design. */
export const STORED_MATTERS = 10e15;
/** At or above this many busy machines at peak, transcoding drives the design. */
export const MACHINES_MATTERS = 1_000;

export type LamhaInputs = { views: number; minutes: number; uploads: number };

export type LamhaEstimate = {
  viewsPerSecond: number;
  viewersAtOnce: number;
  sentAverageBps: number;
  sentPeakBps: number;
  storedYearBytes: number;
  machinesAverage: number;
  machinesPeak: number;
};

export function lamhaEstimate(i: LamhaInputs): LamhaEstimate {
  const viewsPerSecond = i.views / SECONDS_PER_DAY;
  const viewersAtOnce = viewsPerSecond * i.minutes * 60;
  const sentAverageBps = viewersAtOnce * SENT_MBIT * 1e6;
  const machinesAverage = (i.uploads * WORKER_MINUTES_PER_VIDEO) / MINUTES_PER_DAY;
  return {
    viewsPerSecond,
    viewersAtOnce,
    sentAverageBps,
    sentPeakBps: sentAverageBps * PEAK_FACTOR,
    storedYearBytes: i.uploads * STORED_MB_PER_VIDEO * 1e6 * 365,
    machinesAverage,
    machinesPeak: machinesAverage * PEAK_FACTOR,
  };
}

/** "11,574 /s". */
export const perSecond = (n: number) => `${withCommas(n)} /s`;

/** "2.1 million", "208,000", "69,400": two figures for millions, three below. */
export function viewersText(n: number): string {
  if (n >= 1e6) {
    const m = n / 1e6;
    return `${m >= 10 ? Math.round(m) : (Math.round(m * 10) / 10).toString()} million`;
  }
  return sig3(n);
}

/** Busy machines to the nearest hundred once past a thousand: "5,200", "15,600". */
export function machinesText(n: number): string {
  return n >= 1000 ? withCommas(Math.round(n / 100) * 100) : withCommas(n);
}

/** For a screen reader: "12.5 terabits a second". */
export function bitsInWords(bps: number): string {
  return formatBits(bps).replace(" Tbit/s", " terabits a second").replace(" Gbit/s", " gigabits a second").replace(" Mbit/s", " megabits a second").replace(" Pbit/s", " petabits a second");
}

export function bytesInWords(bytes: number): string {
  return formatBytes(bytes).replace(" PB", " petabytes").replace(" TB", " terabytes").replace(" EB", " exabytes").replace(" GB", " gigabytes");
}

export type Driver = "sent" | "stored" | "machines" | "none";

/** The card with the biggest consequence: bandwidth, then storage, then transcoding. */
export function driver(r: LamhaEstimate): Driver {
  if (r.sentPeakBps >= SENT_MATTERS) return "sent";
  if (r.storedYearBytes >= STORED_MATTERS) return "stored";
  if (r.machinesPeak >= MACHINES_MATTERS) return "machines";
  return "none";
}

export type Verdict = { text: string; tone: "good" | "warn" };

/** At most 38 characters. */
export function estimateVerdict(r: LamhaEstimate): Verdict {
  const d = driver(r);
  if (d === "sent") return { text: "Bandwidth drives it: a CDN is a must", tone: "warn" };
  if (d === "stored") return { text: "Storage drives it: plan cold tiers", tone: "warn" };
  if (d === "machines") return { text: "Transcoding drives it: size the fleet", tone: "warn" };
  return { text: "A few servers could serve this", tone: "good" };
}

/** The result in one sentence, for a slider's value text. */
export function estimateTail(r: LamhaEstimate): string {
  return `${withCommas(r.viewsPerSecond)} views a second, ${formatCount(r.viewersAtOnce)} viewers at once, ${bitsInWords(r.sentPeakBps)} at peak, ${bytesInWords(r.storedYearBytes)} stored a year, ${machinesText(r.machinesPeak)} busy machines at peak`;
}

export const viewsText = (n: number) => `${formatCount(n)} views a day`;
export const minutesLabel = (n: number) => `${n} ${n === 1 ? "minute" : "minutes"}`;
export const uploadsText = (n: number) => (n >= 1_000_000 ? `${n / 1_000_000}M` : `${n / 1000}k`);

/** Dots a second on each link, set by the value the link leads to against a round mark. */
export function chainRates(r: LamhaEstimate) {
  return {
    perSecond: flowRate(r.viewsPerSecond / 1_000),
    viewers: flowRate(r.viewersAtOnce / 100_000),
    sentAverage: flowRate(r.sentAverageBps / SENT_MATTERS),
    sentPeak: flowRate(r.sentPeakBps / SENT_MATTERS),
    stored: flowRate(r.storedYearBytes / STORED_MATTERS),
    busyAverage: flowRate(r.machinesAverage / MACHINES_MATTERS),
    busyPeak: flowRate(r.machinesPeak / MACHINES_MATTERS),
  };
}
