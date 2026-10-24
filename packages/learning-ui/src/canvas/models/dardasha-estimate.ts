import { withCommas } from "./picture-controls";
import { formatBytes, flowRate } from "./envelope-estimate";
import { BYTES_PER_MESSAGE, DAYS_PER_YEAR, DEVICES_PER_USER, GATEWAY_PLAN, PEAK_FACTOR, RECIPIENTS, SECONDS_PER_DAY } from "./dardasha-numbers";

// 22.1 "Drag the users, find the load". Dardasha's estimate as a chain of small
// multiplications (the method of chapter 2.3). Pure functions, no React.
//
//   messages a day       = users x messages per user
//   messages a second    = messages a day / 86,400      (peak = average x 3)
//   deliveries a second  = peak x 3 recipients
//   open lines           = users x 1.5 x share online   (gateways = ceil(lines / 50,000))
//   storage a year       = messages a day x 365 x 300 B

export const USER_STEPS = [1_000_000, 5_000_000, 10_000_000, 25_000_000, 50_000_000] as const;
export const MESSAGE_STEPS = [10, 20, 40, 80, 160] as const;
export const ONLINE_STEPS = [0.1, 0.2, 0.3] as const;

/** At or above this many gateways, open connections are the driver. */
export const GATEWAYS_MATTER = 20;
/** At or above this many messages a second at peak, the message rate is the driver. */
export const PEAK_MATTERS = 5_000;
/** At or above this many bytes a year, storage is the driver. */
export const STORAGE_MATTERS = 10e12;

export type ChatInputs = { users: number; perUser: number; online: number };

export type ChatEstimate = {
  messagesPerDay: number;
  averagePerSecond: number;
  peakPerSecond: number;
  deliveriesPerSecond: number;
  openLines: number;
  gateways: number;
  storageBytes: number;
};

export function chatEstimate(i: ChatInputs): ChatEstimate {
  const messagesPerDay = i.users * i.perUser;
  const averagePerSecond = messagesPerDay / SECONDS_PER_DAY;
  const peakPerSecond = averagePerSecond * PEAK_FACTOR;
  // Rounded to a whole line first: 1.5 x 0.2 x 1,000,000 is 300,000.00000000006 in floating point.
  const openLines = Math.round(i.users * DEVICES_PER_USER * i.online);
  return {
    messagesPerDay,
    averagePerSecond,
    peakPerSecond,
    deliveriesPerSecond: peakPerSecond * RECIPIENTS,
    openLines,
    gateways: Math.ceil(openLines / GATEWAY_PLAN),
    storageBytes: messagesPerDay * DAYS_PER_YEAR * BYTES_PER_MESSAGE,
  };
}

/** A rate with its unit and commas: "4,630 /s", "13,889 /s". */
export const ratePerSecond = (n: number) => `${withCommas(n)} /s`;

/** Open lines: "3.0 million" for a million or more, else with commas. */
export function linesText(n: number): string {
  return n >= 1_000_000 ? `${(Math.round(n / 100_000) / 10).toFixed(1)} million` : withCommas(n);
}

export const gatewaysText = (n: number) => `${n} ${n === 1 ? "gateway" : "gateways"}`;

/** Bytes in words for a screen reader: "43.8 terabytes". */
export function bytesInWords(n: number): string {
  return formatBytes(n).replace(" TB", " terabytes").replace(" GB", " gigabytes").replace(" PB", " petabytes").replace(" MB", " megabytes");
}

export type Driver = "lines" | "peak" | "storage" | "none";

/** The card with the biggest consequence: open lines first, then the message rate, then storage, else none. */
export function driver(r: ChatEstimate): Driver {
  if (r.gateways >= GATEWAYS_MATTER) return "lines";
  if (r.peakPerSecond >= PEAK_MATTERS) return "peak";
  if (r.storageBytes >= STORAGE_MATTERS) return "storage";
  return "none";
}

export type Verdict = { text: string; tone: "good" | "warn" };

/** At most 38 characters. */
export function estimateVerdict(r: ChatEstimate): Verdict {
  switch (driver(r)) {
    case "lines":
      return { text: "Open connections drive it", tone: "warn" };
    case "peak":
      return { text: "Message rate drives it", tone: "warn" };
    case "storage":
      return { text: "Storage drives it", tone: "warn" };
    default:
      return { text: "One small cluster could serve this", tone: "good" };
  }
}

export const ringText = (d: Driver) =>
  d === "lines" ? "The open lines card is ringed." : d === "peak" ? "The peak messages card is ringed." : d === "storage" ? "The storage card is ringed." : "No card is ringed.";

/** The result in one sentence, for a slider's value text. */
export function estimateTail(r: ChatEstimate): string {
  return `${linesText(r.openLines)} open lines, ${gatewaysText(r.gateways)}, ${withCommas(r.peakPerSecond)} messages a second at peak, ${bytesInWords(r.storageBytes)} a year`;
}

export const onlineText = (share: number) => `${Math.round(share * 100)}%`;

/** Dots a second on each link, set by the value the link leads to against a plan or a mark. */
export function chainRates(r: ChatEstimate) {
  return {
    day: flowRate(r.messagesPerDay / 400e6),
    average: flowRate(r.averagePerSecond / 2_000),
    peak: flowRate(r.peakPerSecond / 2_000),
    deliveries: flowRate(r.deliveriesPerSecond / 5_000),
    lines: flowRate(r.openLines / GATEWAY_PLAN / 10),
    gateways: flowRate(r.gateways / 10),
    storage: flowRate(r.storageBytes / STORAGE_MATTERS),
  };
}
