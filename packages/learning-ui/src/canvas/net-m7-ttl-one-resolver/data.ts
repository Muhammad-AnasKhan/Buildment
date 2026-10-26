import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// 7.4 beat 3 (playable): shop.example.com changes from 203.0.113.45 to
// 203.0.113.46 at 10:00. One resolver copied the old answer at 09:58 with a TTL
// of 3600 seconds, so it keeps serving the old address until 10:58 [S24].
// Times are counted in minutes from 09:00. A TTL is the seconds a copy may be
// kept, and zero means do not cache [S24]. The addresses are documentation
// addresses [S10]; the name and the times are made up for the lesson. The
// planned timeline renderer does not exist as data-driven code yet, so the
// slider renderer (a draggable model with a plain-language result) stands in
// for it, with the same slug.

/** Minutes after 09:00. */
export const CLOCK_START = 9 * 60;
/** A TTL of 3600 seconds, in minutes. */
export const TTL_MINUTES = 60;

/** 58 -> "09:58"; the clock of the lesson starts at 09:00. */
export function clock(minutesAfterStart: number): string {
  const total = CLOCK_START + Math.round(minutesAfterStart);
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function minutesText(m: number): string {
  const whole = Math.round(m);
  if (whole <= 0) return "0 min";
  if (whole === 60) return "1 hour";
  return `${whole} min`;
}

export type OneResolver = {
  /** True if the resolver still holds the old address when the record changes. */
  holdsOld: boolean;
  expiresAt: number;
  /** Minutes after the change during which the resolver still gives the old address. */
  staleMin: number;
  /** The minute from which laptops behind this resolver get the new address. */
  newFrom: number;
};

/**
 * A copy cached at `cachedAt` lives one TTL. If it was made before the change
 * and has not run out, the resolver keeps giving the old address until it
 * expires. If it ran out before the change, or was made after it, the next
 * lookup already gets the new address.
 */
export function oneResolver(changeAt: number, cachedAt: number): OneResolver {
  const expiresAt = cachedAt + TTL_MINUTES;
  const holdsOld = cachedAt <= changeAt && expiresAt > changeAt;
  return {
    holdsOld,
    expiresAt,
    staleMin: holdsOld ? expiresAt - changeAt : 0,
    newFrom: holdsOld ? expiresAt : changeAt,
  };
}

function valuesOf(values: SliderValues) {
  return { changeAt: values.changeAt ?? 60, cachedAt: values.cachedAt ?? 58 };
}

export function computeOneResolver(values: SliderValues): SliderResult {
  const { changeAt, cachedAt } = valuesOf(values);
  const r = oneResolver(changeAt, cachedAt);
  const summary = r.holdsOld
    ? `The resolver cached 203.0.113.45 at ${clock(cachedAt)} with a TTL of 1 hour. The record changes at ${clock(changeAt)}, so laptops behind this resolver keep getting the old address until ${clock(r.expiresAt)}, which is ${minutesText(r.staleMin)} after the change.`
    : cachedAt > changeAt
      ? `The resolver cached its copy at ${clock(cachedAt)}, after the change at ${clock(changeAt)}, so its copy already holds the new address 203.0.113.46. Nothing is old.`
      : `The resolver's copy from ${clock(cachedAt)} ran out at ${clock(r.expiresAt)}, before the change at ${clock(changeAt)}. The next lookup gets the new address 203.0.113.46 at once.`;
  return {
    stats: [
      {
        label: "Old address served until",
        value: r.holdsOld ? clock(r.expiresAt) : "not at all",
        detail: r.holdsOld ? `copy made at ${clock(cachedAt)}, TTL 1 hour` : "no old copy after the change",
      },
      { label: "Still old after the change", value: minutesText(r.staleMin), detail: `the record changes at ${clock(changeAt)}` },
      { label: "New address from", value: clock(r.newFrom), detail: r.holdsOld ? "when the copy runs out" : "at the change" },
    ],
    bars: [
      { label: "Old address after the change", value: r.staleMin, display: minutesText(r.staleMin), tone: r.staleMin > 0 ? "bad" : undefined },
      { label: "Longest possible: one TTL", value: TTL_MINUTES, display: "1 hour" },
    ],
    barMax: TTL_MINUTES,
    summary,
  };
}

export function describeOneResolverChange(before: SliderValues, after: SliderValues): string {
  const a = valuesOf(before);
  const b = valuesOf(after);
  if (a.changeAt === b.changeAt && a.cachedAt === b.cachedAt) return "Nothing changed.";
  const x = oneResolver(a.changeAt, a.cachedAt);
  const y = oneResolver(b.changeAt, b.cachedAt);
  const what =
    a.changeAt !== b.changeAt && a.cachedAt !== b.cachedAt ? "Moving both times" : a.changeAt !== b.changeAt ? "Moving the change" : "Moving the cache time";
  if (!y.holdsOld) {
    return `${what} means no old copy is left after the change: laptops get the new address from ${clock(y.newFrom)}. Before, the old address lasted ${minutesText(x.staleMin)} after the change.`;
  }
  return `${what}: the old address now lasts ${minutesText(y.staleMin)} after the change, until ${clock(y.expiresAt)}. Before it lasted ${minutesText(x.staleMin)}. A copy can never outlive its TTL, so the wait is at most 1 hour.`;
}

export const netM7TtlOneResolver: SliderSpec = {
  kind: "slider",
  title: "One resolver keeps the old answer",
  purpose: "Drag the time the record changes and the time the resolver made its copy, and see how long laptops behind it still get the old address.",
  intro:
    "shop.example.com changes from 203.0.113.45 to 203.0.113.46 at 10:00. A resolver copied the old answer at 09:58 and may keep it for its TTL of 3600 seconds. Predict until when laptops behind it still get the old address, then drag the times.",
  inputs: [
    { id: "changeAt", label: "Change time (min after 9:00)", min: 0, max: 150, step: 1, default: 60, unit: "min" },
    { id: "cachedAt", label: "Copy time (min after 9:00)", min: 0, max: 150, step: 1, default: 58, unit: "min" },
  ],
  compute: computeOneResolver,
  describeChange: describeOneResolverChange,
  barsTitle: "How long the old address lasts",
  tryThis: [
    "Move the change to 09:30. The copy was made at 09:58, after the change, so it already holds the new address and nothing is old.",
    "Set the change to 10:58 or later. The copy has run out by then, so the next lookup gets the new address at once.",
  ],
  limits:
    "A fixed model: one resolver, a TTL of 3600 seconds and a single copy. It has no live DNS, no resolvers that ignore TTLs and no negative caching. The name, the times and the addresses are made up; the addresses come from a documentation range.",
};
