// Back-of-the-envelope estimate: from daily users to requests per second,
// storage per year and bandwidth, with a unit at every step. Pure functions,
// no React. The starting values and the rules of thumb live in the slug's
// data.ts, so a case study can reuse the model with its own numbers.

export const SECONDS_PER_DAY = 86_400;
export const DAYS_PER_YEAR = 365;

export type EnvelopeInputs = {
  /** Daily active users. */
  users: number;
  /** Requests each user makes a day. */
  requestsPerUser: number;
  /** How many times busier the busiest minute is than the average. */
  peakFactor: number;
  /** Size of one stored item (a voice note), in bytes. */
  itemBytes: number;
  /** Share of users who store one new item a day, 0 to 1. */
  writeShare: number;
  /** Items each user reads (plays) a day. */
  readsPerUser: number;
  /** Copies kept of everything stored. */
  copies: number;
};

export type EnvelopeResult = {
  requestsPerDay: number;
  averagePerSecond: number;
  peakPerSecond: number;
  storedPerDayBytes: number;
  storedPerYearBytes: number;
  sentPerDayBytes: number;
  averageBitsPerSecond: number;
  peakBitsPerSecond: number;
};

const pos = (n: number) => (Number.isFinite(n) ? Math.max(0, n) : 0);

export function estimateEnvelope(i: EnvelopeInputs): EnvelopeResult {
  const users = pos(i.users);
  const peak = Math.max(1, pos(i.peakFactor));
  const requestsPerDay = users * pos(i.requestsPerUser);
  const averagePerSecond = requestsPerDay / SECONDS_PER_DAY;
  const storedPerDayBytes = users * Math.min(1, pos(i.writeShare)) * pos(i.itemBytes);
  const sentPerDayBytes = users * pos(i.readsPerUser) * pos(i.itemBytes);
  const averageBitsPerSecond = (sentPerDayBytes / SECONDS_PER_DAY) * 8;
  return {
    requestsPerDay,
    averagePerSecond,
    peakPerSecond: averagePerSecond * peak,
    storedPerDayBytes,
    storedPerYearBytes: storedPerDayBytes * DAYS_PER_YEAR * Math.max(1, Math.floor(pos(i.copies))),
    sentPerDayBytes,
    averageBitsPerSecond,
    peakBitsPerSecond: averageBitsPerSecond * peak,
  };
}

/** Three significant figures, with commas, and no trailing ".0": 231, 20, 7.3, 21.9. */
export function sig3(n: number): string {
  const v = pos(n);
  if (v === 0) return "0";
  if (v >= 1000) {
    const unit = Math.pow(10, Math.floor(Math.log10(v)) - 2);
    return (Math.round(v / unit) * unit).toLocaleString("en-US");
  }
  const digits = Math.max(0, 2 - Math.floor(Math.log10(v)));
  const text = v.toFixed(digits);
  return text.includes(".") ? text.replace(/0+$/, "").replace(/\.$/, "") : text;
}

/** A count in words: "694", "231,000", "20 million", "1 billion". */
export function formatCount(n: number): string {
  const v = pos(n);
  if (v >= 1e9) return `${sig3(v / 1e9)} billion`;
  if (v >= 1e6) return `${sig3(v / 1e6)} million`;
  return sig3(v);
}

/** A count for a short verdict: "694", "231,000", "11.6M". */
export function formatCountShort(n: number): string {
  const v = pos(n);
  if (v >= 1e9) return `${sig3(v / 1e9)}B`;
  if (v >= 1e6) return `${sig3(v / 1e6)}M`;
  return sig3(v);
}

/** Bytes with 1 KB = 1,000 bytes, as the chapter does. */
export function formatBytes(n: number): string {
  const units = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB"];
  let v = pos(n);
  let u = 0;
  while (v >= 1000 && u < units.length - 1) {
    v /= 1000;
    u++;
  }
  return `${sig3(v)} ${units[u]}`;
}

/** Network speed in bits per second. */
export function formatBits(n: number): string {
  const units = ["bit/s", "kbit/s", "Mbit/s", "Gbit/s", "Tbit/s", "Pbit/s"];
  let v = pos(n);
  let u = 0;
  while (v >= 1000 && u < units.length - 1) {
    v /= 1000;
    u++;
  }
  return `${sig3(v)} ${units[u]}`;
}

export type Limits = {
  /** Requests a second one server handles, as a rule of thumb. */
  serverPerSecond: number;
  /** Bytes one large disk holds. */
  diskBytes: number;
  /** Bits a second one network link carries. */
  linkBitsPerSecond: number;
};

export type DrivingKey = "requests" | "storage" | "bandwidth";

export type Pressure = { key: DrivingKey; value: number; ratio: number };

/** Each result against its rule of thumb; 1 means "just fits on one machine". */
export function pressures(r: EnvelopeResult, l: Limits): Pressure[] {
  return [
    { key: "requests", value: r.peakPerSecond, ratio: r.peakPerSecond / l.serverPerSecond },
    { key: "storage", value: r.storedPerYearBytes, ratio: r.storedPerYearBytes / l.diskBytes },
    { key: "bandwidth", value: r.peakBitsPerSecond, ratio: r.peakBitsPerSecond / l.linkBitsPerSecond },
  ];
}

/** The number that drives the design: the one furthest past (or nearest to) its limit. */
export function drivingNumber(r: EnvelopeResult, l: Limits): Pressure {
  return pressures(r, l).reduce((a, b) => (b.ratio > a.ratio ? b : a));
}

export type Tone = "good" | "warn" | "bad";

export function pressureTone(ratio: number): Tone {
  return ratio > 1 ? "bad" : ratio > 0.5 ? "warn" : "good";
}

/** The verdict for the driving number, at most 38 characters. */
export function envelopeVerdict(r: EnvelopeResult, l: Limits): { key: DrivingKey; text: string; tone: Tone } {
  const d = drivingNumber(r, l);
  const over = d.ratio > 1;
  const tone = pressureTone(d.ratio);
  if (d.key === "requests") {
    const n = formatCountShort(d.value);
    return { key: d.key, tone, text: over ? `Peak ${n}/s: one server will not do` : `Peak ${n}/s: one server copes` };
  }
  if (d.key === "storage") {
    const v = formatBytes(d.value);
    return { key: d.key, tone, text: over ? `${v} a year: more than one disk` : `${v} a year: one disk holds it` };
  }
  const v = formatBits(d.value);
  return { key: d.key, tone, text: over ? `Peak ${v}: needs many links` : `Peak ${v}: one link copes` };
}

/** Dots per second along a chain column: grows with the log of the pressure. */
export function flowRate(ratio: number): number {
  const r = ratio > 0 && Number.isFinite(ratio) ? ratio : 1e-6;
  return Math.max(0.3, Math.min(6, 1.4 * Math.pow(2, 1.2 * Math.log10(r))));
}

/** Move along a list of allowed values by whole steps. */
export function stepValue(steps: readonly number[], value: number, delta: number): number {
  let index = steps.indexOf(value);
  if (index < 0) index = nearestStepIndex(steps, value);
  return steps[Math.max(0, Math.min(steps.length - 1, index + Math.round(delta)))];
}

export function nearestStepIndex(steps: readonly number[], value: number): number {
  let best = 0;
  for (let i = 1; i < steps.length; i++) if (Math.abs(steps[i] - value) < Math.abs(steps[best] - value)) best = i;
  return best;
}
