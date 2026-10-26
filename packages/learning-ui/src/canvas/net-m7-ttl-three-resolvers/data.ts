import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// 7.4 beat 4 (playable): shop.example.com changes from 203.0.113.45 to
// 203.0.113.46. Three resolvers copied the old answer; their TTLs are 60
// seconds, 3600 seconds and 86400 seconds (1 minute, 1 hour and 1 day). Each
// keeps its copy for its own TTL, so each flips from old to new at a
// different time [S24]. Times are counted in minutes from 09:00, in steps of
// half a minute. The addresses are documentation addresses [S10]; the name and
// the times are made up for the lesson. The planned timeline renderer does not
// exist as data-driven code yet, so the slider renderer stands in for it, with
// the same slug.

export const CLOCK_START = 9 * 60;

export type ResolverRow = { id: "a" | "b" | "c"; name: string; ttlText: string; ttlMinutes: number };

export const RESOLVERS: readonly ResolverRow[] = [
  { id: "a", name: "Resolver A", ttlText: "60 s", ttlMinutes: 1 },
  { id: "b", name: "Resolver B", ttlText: "1 hour", ttlMinutes: 60 },
  { id: "c", name: "Resolver C", ttlText: "1 day", ttlMinutes: 1440 },
];

/** The longest a copy can last after a change is one TTL; the bar scale is the longest TTL. */
export const BAR_MAX = 1440;

/** Minutes after 09:00 as a clock time; half minutes show seconds; past midnight adds "next day". */
export function clock(minutesAfterStart: number): string {
  const total = CLOCK_START + minutesAfterStart;
  const day = Math.floor(total / 1440);
  const inDay = total - day * 1440;
  const h = Math.floor(inDay / 60);
  const m = Math.floor(inDay % 60);
  const s = Math.round((inDay - Math.floor(inDay)) * 60);
  const base = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}${s ? `:${String(s).padStart(2, "0")}` : ""}`;
  return day > 0 ? `${base} next day` : base;
}

/** 0.5 -> "30 s"; 58 -> "58 min"; 1438 -> "23 h 58 min". */
export function durationText(minutes: number): string {
  if (minutes <= 0) return "0 min";
  if (minutes < 1) return `${Math.round(minutes * 60)} s`;
  const whole = Math.floor(minutes);
  const secs = Math.round((minutes - whole) * 60);
  if (whole < 60) return secs ? `${whole} min ${secs} s` : `${whole} min`;
  const h = Math.floor(whole / 60);
  const m = whole % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export type Flip = { holdsOld: boolean; expiresAt: number; staleMin: number; newFrom: number };

/** Same rule as net-m7-ttl-one-resolver, for any TTL. */
export function flip(changeAt: number, cachedAt: number, ttlMinutes: number): Flip {
  const expiresAt = cachedAt + ttlMinutes;
  const holdsOld = cachedAt <= changeAt && expiresAt > changeAt;
  return { holdsOld, expiresAt, staleMin: holdsOld ? expiresAt - changeAt : 0, newFrom: holdsOld ? expiresAt : changeAt };
}

type Inputs = { changeAt: number; cachedA: number; cachedB: number; cachedC: number };

function inputsOf(values: SliderValues): Inputs {
  return { changeAt: values.changeAt ?? 60, cachedA: values.cachedA ?? 59.5, cachedB: values.cachedB ?? 58, cachedC: values.cachedC ?? 58 };
}

function flipsOf(i: Inputs): Flip[] {
  const cached = [i.cachedA, i.cachedB, i.cachedC];
  return RESOLVERS.map((r, k) => flip(i.changeAt, cached[k], r.ttlMinutes));
}

export function computeThreeResolvers(values: SliderValues): SliderResult {
  const i = inputsOf(values);
  const flips = flipsOf(i);
  const cached = [i.cachedA, i.cachedB, i.cachedC];
  const order = RESOLVERS.map((r, k) => ({ r, f: flips[k] })).sort((x, y) => x.f.newFrom - y.f.newFrom);
  const first = order[0];
  const last = order[order.length - 1];
  return {
    stats: RESOLVERS.map((r, k) => ({
      label: `${r.name}, TTL ${r.ttlText}`,
      value: clock(flips[k].newFrom),
      detail: flips[k].holdsOld ? `old for ${durationText(flips[k].staleMin)} after the change` : `copy made at ${clock(cached[k])}: no old copy left`,
    })),
    bars: RESOLVERS.map((r, k) => ({
      label: `${r.name}, TTL ${r.ttlText}`,
      value: flips[k].staleMin,
      display: durationText(flips[k].staleMin),
      tone: flips[k].staleMin >= 60 ? "bad" : undefined,
    })),
    barMax: BAR_MAX,
    summary: `The record changes at ${clock(i.changeAt)}. ${first.r.name} gives the new address first, from ${clock(first.f.newFrom)}. ${last.r.name} gives it last, from ${clock(last.f.newFrom)}, which is ${durationText(last.f.staleMin)} after the change. A longer TTL keeps the old address longer.`,
  };
}

export function describeThreeResolversChange(before: SliderValues, after: SliderValues): string {
  const a = inputsOf(before);
  const b = inputsOf(after);
  const fa = flipsOf(a);
  const fb = flipsOf(b);
  const names = RESOLVERS.map((r) => r.name);
  const changed: string[] = [];
  if (a.changeAt !== b.changeAt) changed.push("the change time");
  if (a.cachedA !== b.cachedA) changed.push("A's cache time");
  if (a.cachedB !== b.cachedB) changed.push("B's cache time");
  if (a.cachedC !== b.cachedC) changed.push("C's cache time");
  if (changed.length === 0) return "Nothing changed.";
  const moves = RESOLVERS.map((_, k) => (fa[k].staleMin !== fb[k].staleMin ? `${names[k]} now keeps the old address ${durationText(fb[k].staleMin)} (before ${durationText(fa[k].staleMin)})` : null)).filter(Boolean);
  const head = changed.length === 1 ? `Moving ${changed[0]}` : "Moving several times";
  return moves.length > 0 ? `${head}: ${moves.join("; ")}.` : `${head} changes nothing here: every resolver keeps the old address as long as before.`;
}

export const netM7TtlThreeResolvers: SliderSpec = {
  kind: "slider",
  title: "Short and long TTLs spread differently",
  purpose: "Three resolvers with a TTL of 60 seconds, 1 hour and 1 day keep the old address for different times after a change. Drag the change time and the cache times.",
  intro:
    "shop.example.com changes from 203.0.113.45 to 203.0.113.46 at 10:00. Three resolvers copied the old answer just before. Their TTLs are 60 seconds, 1 hour and 1 day. Predict which one gives the new address first and which one last, then drag the times.",
  inputs: [
    { id: "changeAt", label: "Change time (min after 9:00)", min: 0, max: 180, step: 0.5, default: 60, unit: "min" },
    { id: "cachedA", label: "A (TTL 60 s) copied at", min: 0, max: 180, step: 0.5, default: 59.5, unit: "min" },
    { id: "cachedB", label: "B (TTL 1 hour) copied at", min: 0, max: 180, step: 0.5, default: 58, unit: "min" },
    { id: "cachedC", label: "C (TTL 1 day) copied at", min: 0, max: 180, step: 0.5, default: 58, unit: "min" },
  ],
  compute: computeThreeResolvers,
  describeChange: describeThreeResolversChange,
  barsTitle: "How long each resolver keeps the old address after the change",
  tryThis: [
    "Move the change to 10:30. A's copy has long run out, B still holds the old address until 10:58, and C holds it until 09:58 tomorrow.",
    "Set C's copy time to 09:00. C copied earlier, so its copy runs out earlier, but it still keeps the old address for 23 hours after the change.",
  ],
  limits:
    "A fixed model: three resolvers, one copy each, and TTLs of 60 s, 1 hour and 1 day. It has no live DNS, no resolvers that ignore TTLs and no negative caching. Lowering a record's TTL does not change copies that resolvers already hold: they keep their old TTL. The name, the times and the addresses are made up; the addresses come from a documentation range.",
};
