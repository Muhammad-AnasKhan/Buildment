// Availability maths for a chain of parts: parts in series multiply their
// availabilities, copies in parallel multiply their down chances. Both rules
// assume parts fail independently. Pure functions, no React.

export const HOURS_PER_YEAR = 8_760;
export const DAYS_PER_YEAR = 365;

const clamp01 = (a: number) => (Number.isFinite(a) ? Math.max(0, Math.min(1, a)) : 0);

/** Every part must work: multiply. An empty chain never fails. */
export function seriesAvailability(parts: readonly number[]): number {
  return parts.reduce((total, a) => total * clamp01(a), 1);
}

/** Any one of n identical copies is enough: 1 - (1 - a)^n. No copies means never up. */
export function parallelAvailability(a: number, copies: number): number {
  const n = Math.max(0, Math.floor(copies));
  if (n === 0) return 0;
  return 1 - Math.pow(1 - clamp01(a), n);
}

export type PartGroup = {
  id: string;
  name: string;
  /** One copy's availability, 0 to 1. */
  availability: number;
  /** 0 means the part is not in the chain. */
  copies: number;
};

export type GroupResult = PartGroup & {
  /** The whole parallel group's availability. */
  group: number;
  /** Hours a year this group alone would be down. */
  downHours: number;
};

export type ChainResult = {
  groups: GroupResult[];
  availability: number;
  downHours: number;
  /** The group with the most downtime: fix this one next. */
  weakest: GroupResult | null;
};

/** Collapse each parallel group, then multiply the chain. */
export function chainAvailability(parts: readonly PartGroup[]): ChainResult {
  const groups = parts
    .filter((p) => p.copies > 0)
    .map((p) => {
      const group = parallelAvailability(p.availability, p.copies);
      return { ...p, group, downHours: (1 - group) * HOURS_PER_YEAR };
    });
  const availability = seriesAvailability(groups.map((g) => g.group));
  const weakest = groups.reduce<GroupResult | null>((w, g) => (!w || g.downHours >= w.downHours ? g : w), null);
  return { groups, availability, downHours: (1 - availability) * HOURS_PER_YEAR, weakest };
}

const trimZeros = (s: string) => (s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s);

/**
 * Availability as a percent with enough decimals to show where the nines
 * stop, and never rounded up to 100% unless it is exactly 1.
 */
export function formatAvailability(a: number): string {
  const v = clamp01(a);
  if (v >= 1) return "100%";
  if (v <= 0) return "0%";
  const down = 1 - v;
  let decimals = Math.max(1, Math.ceil(-Math.log10(down) - 1e-9) - 1);
  let text = (v * 100).toFixed(decimals);
  while (Number(text) >= 100 && decimals < 8) text = (v * 100).toFixed(++decimals);
  return `${trimZeros(text)}%`;
}

/** Two significant figures, whole numbers from 10 up: "9.6", "18", "53". */
function sig2(n: number): string {
  if (n >= 10) return Math.round(n).toLocaleString("en-US");
  return trimZeros((Math.round(n * 10) / 10).toFixed(1));
}

function plural(n: string, word: string): string {
  return `${n} ${n === "1" ? word : `${word}s`}`;
}

/** Downtime a year in the unit a person feels: seconds, minutes, hours or days. */
export function formatDowntime(hours: number): string {
  const h = Number.isFinite(hours) ? Math.max(0, hours) : 0;
  if (h === 0) return "no time";
  if (h < 1 / 60) return plural(sig2(h * 3600), "second");
  if (h < 1) return plural(sig2(h * 60), "minute");
  if (h < 48) return plural(sig2(h), "hour");
  return plural(sig2(h / 24), "day");
}

export type VerdictTone = "good" | "warn" | "bad";

export function availabilityVerdict(result: ChainResult): { text: string; tone: VerdictTone } {
  if (result.groups.length === 0) return { text: "No parts: nothing can fail", tone: "good" };
  const text = `${formatAvailability(result.availability)}: ${formatDowntime(result.downHours)} down a year`;
  const tone: VerdictTone = result.downHours <= 1 ? "good" : result.downHours <= 24 ? "warn" : "bad";
  return { text, tone };
}

export type RedDay = {
  /** Day of the year, 0 to 364. */
  day: number;
  /** 0 to 1: how much of that day is down. */
  fraction: number;
  /** The group whose failure this day stands for. */
  groupId: string;
};

/**
 * Days that would be fixed in the picture as a stable "random" spread,
 * so red squares do not jump around as the learner taps.
 */
export function spreadDay(i: number): number {
  return (37 + i * 151) % DAYS_PER_YEAR;
}

/**
 * The year's downtime as red days, one group at a time, worst group first.
 * Each group's share uses the add-the-downtimes shortcut, scaled so the red
 * total equals the exact chain downtime.
 */
export function redDays(result: ChainResult): RedDay[] {
  const sum = result.groups.reduce((s, g) => s + g.downHours, 0);
  if (sum <= 0 || result.downHours <= 0) return [];
  const scale = result.downHours / sum;
  const ordered = [...result.groups].sort((a, b) => b.downHours - a.downHours);
  const out: RedDay[] = [];
  let slot = 0;
  for (const g of ordered) {
    let days = (g.downHours * scale) / 24;
    while (days > 1e-9 && out.length < DAYS_PER_YEAR) {
      out.push({ day: spreadDay(slot++), fraction: Math.min(1, days), groupId: g.id });
      days -= 1;
    }
  }
  return out;
}
