import { withCommas } from "./picture-controls";

// 26.3 "When to visit a page again". Changes are modelled as random events at
// an average rate c a day; the strip draws them evenly spaced so the picture
// is deterministic. A visit every T days gives (T in days):
//
//   fresh share of time  = (1 - e^(-cT)) / (cT)
//   wasted share of visits = e^(-cT)
//   visits a page a month = 30 / T;  visits a day for 10 million pages = 10,000,000 / T

export type PageKind = "news" | "product" | "old";

export const KINDS: { id: PageKind; chip: string; label: string; perDay: number; words: string }[] = [
  { id: "news", chip: "News front page", label: "News front page", perDay: 6, words: "changes 6 times a day" },
  { id: "product", chip: "Product page", label: "Product page", perDay: 1 / 7, words: "changes once a week" },
  { id: "old", chip: "Old article", label: "Old article", perDay: 1 / 90, words: "changes once in 90 days" },
];
export const KIND_DEFAULT: PageKind = "news";

/** Visit gaps in days: 1 hour, 4 hours, 12 hours, 1 day, 3 days, 7 days, 14 days, 30 days, 90 days. */
export const GAPS = [1 / 24, 4 / 24, 12 / 24, 1, 3, 7, 14, 30, 90] as const;
export const GAP_DEFAULT = 1;
export const PAGES = 10_000_000;

export const kindById = (id: PageKind) => KINDS.find((k) => k.id === id) ?? KINDS[0];

export type Recrawl = {
  perDay: number;
  gapDays: number;
  /** Changes per gap, c x T. */
  product: number;
  fresh: number;
  wasted: number;
  visitsPerDay: number;
  visitsPerMonth: number;
};

export function recrawl(perDay: number, gapDays: number): Recrawl {
  const x = perDay * gapDays;
  return {
    perDay,
    gapDays,
    product: x,
    fresh: x > 0 ? (1 - Math.exp(-x)) / x : 1,
    wasted: Math.exp(-x),
    visitsPerDay: PAGES / gapDays,
    visitsPerMonth: 30 / gapDays,
  };
}

export const percent = (share: number) => Math.round(share * 100);

export type Verdict = { text: string; tone: "good" | "warn" | "bad" };

/** At most 38 characters. */
export function recrawlVerdict(r: Recrawl): Verdict {
  if (r.wasted > 0.7) return { text: "Most visits find nothing new", tone: "warn" };
  if (r.fresh < 0.5) return { text: "Stale most of the time", tone: "bad" };
  return { text: "Fresh enough, little wasted", tone: "good" };
}

/** The gap in words: "1 hour", "4 hours", "1 day", "90 days". */
export function gapText(days: number): string {
  if (days < 1) {
    const h = Math.round(days * 24);
    return `${h} ${h === 1 ? "hour" : "hours"}`;
  }
  return `${days} ${days === 1 ? "day" : "days"}`;
}

/** Visits a day for 10 million pages: "240 million", "3.3 million", "0.33 million". */
export function visitsText(visitsPerDay: number): string {
  const m = visitsPerDay / 1e6;
  if (m >= 10) return `${withCommas(m)} million`;
  const text = m >= 1 ? m.toFixed(1) : Number(m.toPrecision(2)).toString();
  return `${text.replace(/\.0$/, "")} million`;
}

export function recrawlValueText(kind: PageKind, r: Recrawl): string {
  return `${kindById(kind).label}, visit every ${gapText(r.gapDays)}, fresh ${percent(r.fresh)} percent, wasted ${percent(r.wasted)} percent`;
}

export const MAX_MARKS = 48;
export const STRIP_VISITS = 8;

export type Strip = {
  /** Length of the strip in days. */
  days: number;
  /** Change times, in days from the left edge (evenly spaced at the average rate). */
  changes: number[];
  /** True when more changes than fit were left out: the row is drawn at its densest. */
  denseChanges: boolean;
  visits: number[];
  denseVisits: boolean;
};

/**
 * The strip: long enough for eight visits and at least two changes. Both rows
 * are evenly spaced, so the picture does not change between renders. A row
 * with more than 48 marks is drawn as 48 evenly spaced marks and flagged dense.
 */
export function strip(perDay: number, gapDays: number): Strip {
  const days = Math.max(STRIP_VISITS * gapDays, 2.5 / perDay);
  const changeCount = Math.floor(days * perDay);
  const visitCount = Math.floor(days / gapDays);
  const spaced = (count: number, every: number) => {
    const dense = count > MAX_MARKS;
    if (dense) return { marks: Array.from({ length: MAX_MARKS }, (_, i) => ((i + 0.5) / MAX_MARKS) * days), dense };
    return { marks: Array.from({ length: count }, (_, i) => (i + 0.5) * every), dense };
  };
  const c = spaced(changeCount, 1 / perDay);
  const v = spaced(visitCount, gapDays);
  return { days, changes: c.marks, denseChanges: c.dense, visits: v.marks, denseVisits: v.dense };
}
