// 19.6 beat 3: the write delay depends on how far the data's leader and its
// confirming copy are from the user. One convention for all three designs: the
// leader's local work is 0.55 ms (a 0.3 ms disk write plus a 0.25 ms round trip
// to one follower in its own region, as in 8.3). Round trips come from the
// course latency table: NA East to NA West 60 ms, EU West to NA East 80 ms. The
// EU West to NA West round trip is not in the table and no design here needs it.

export type RegionId = "naw" | "nae" | "eu";
export type DesignId = "one" | "home" | "global";

export const LOCAL_WORK_MS = 0.55;
export const REGIONS: readonly { id: RegionId; name: string }[] = [
  { id: "naw", name: "NA West" },
  { id: "nae", name: "NA East" },
  { id: "eu", name: "EU West" },
];
export const DESIGNS: readonly { id: DesignId; label: string; full: string }[] = [
  { id: "one", label: "One leader", full: "One leader in NA East, copies elsewhere" },
  { id: "home", label: "Home region", full: "A home region per customer" },
  { id: "global", label: "Global DB", full: "A global database, majority of three copies" },
];
export const DEFAULT_LOCATION: RegionId = "eu";
export const DEFAULT_DESIGN: DesignId = "one";

export const regionName = (r: RegionId) => REGIONS.find((x) => x.id === r)?.name ?? r;
export const regionIndex = (r: RegionId) => REGIONS.findIndex((x) => x.id === r);
export const regionAt = (i: number): RegionId => REGIONS[Math.max(0, Math.min(REGIONS.length - 1, Math.round(i)))].id;

/** The round trip between two regions, or null when the course table has no figure. */
export function roundTrip(a: RegionId, b: RegionId): number | null {
  if (a === b) return 0;
  const pair = [a, b].sort().join("|");
  if (pair === "nae|naw") return 60;
  if (pair === "eu|nae") return 80;
  return null;
}

/** The leader's region for a design when the customer is in `location`. */
export function leaderOf(design: DesignId, location: RegionId): RegionId {
  return design === "one" ? "nae" : location;
}

/** The nearest other region to a region, for the confirming copy of a global database. */
export function nearestOther(region: RegionId): RegionId {
  return region === "nae" ? "naw" : region === "naw" ? "nae" : "nae";
}

/** The write time in ms: the trip to the leader, the leader's work, and (global) the trip to the nearest other copy. */
export function writeMs(design: DesignId, location: RegionId): number {
  const leader = leaderOf(design, location);
  const trip = roundTrip(location, leader) ?? 0;
  const confirm = design === "global" ? (roundTrip(leader, nearestOther(leader)) ?? 0) : 0;
  return trip + LOCAL_WORK_MS + confirm;
}

/** Whole ms above 10, one decimal below. */
export function formatMs(ms: number): string {
  return ms >= 10 ? `${Math.round(ms)} ms` : `${(Math.round(ms * 10) / 10).toFixed(1)} ms`;
}

/** Do EU rows stay in the EU? Global databases break it unless every copy is inside the EU. */
export const euRowsStayInEu = (design: DesignId) => design === "home";

export type Leg = { from: RegionId; to: RegionId; kind: "write" | "copy" | "ack" | "reply" };

/** The messages of one write, in order. */
export function legsFor(design: DesignId, location: RegionId): Leg[] {
  const leader = leaderOf(design, location);
  const legs: Leg[] = [];
  if (leader !== location) legs.push({ from: location, to: leader, kind: "write" });
  if (design === "global") {
    const other = nearestOther(leader);
    legs.push({ from: leader, to: other, kind: "copy" }, { from: other, to: leader, kind: "ack" });
  }
  if (leader !== location) legs.push({ from: leader, to: location, kind: "reply" });
  return legs;
}

export type Verdict = { text: string; tone: "good" | "warn" | "bad" | "accent" };

export function verdictFor(design: DesignId, location: RegionId): Verdict {
  const ms = formatMs(writeMs(design, location));
  const tone = writeMs(design, location) < 10 ? "good" : "warn";
  if (design === "one") {
    if (location === "nae") return { text: `${ms}: leader is next door`, tone };
    return { text: `${ms}: trip to the NA East leader`, tone };
  }
  if (design === "home") return { text: `${ms}: data lives where you are`, tone };
  return { text: `${ms}: nearest other copy is ${regionName(nearestOther(location))}`, tone };
}

export const LEG_SECONDS = 0.9;
export const WORK_SECONDS = 0.6;
export const HOLD_SECONDS = 1.2;

export type Beat =
  | { kind: "leg"; leg: Leg; start: number; end: number }
  | { kind: "work"; start: number; end: number }
  | { kind: "hold"; start: number; end: number };

/**
 * One write as a loop for the picture: the request travels to the leader, the
 * leader works while the ring fills (and, for a global database, waits for the
 * nearest other copy), then the reply travels back and the picture holds.
 */
export function writeSchedule(design: DesignId, location: RegionId): { beats: Beat[]; total: number; ringStart: number; ringEnd: number } {
  const legs = legsFor(design, location);
  const beats: Beat[] = [];
  let t = 0;
  const leg = (l: Leg) => {
    beats.push({ kind: "leg", leg: l, start: t, end: t + LEG_SECONDS });
    t += LEG_SECONDS;
  };
  const write = legs.find((l) => l.kind === "write");
  if (write) leg(write);
  const ringStart = t;
  beats.push({ kind: "work", start: t, end: t + WORK_SECONDS });
  t += WORK_SECONDS;
  for (const l of legs) if (l.kind === "copy" || l.kind === "ack") leg(l);
  const ringEnd = t;
  const reply = legs.find((l) => l.kind === "reply");
  if (reply) leg(reply);
  beats.push({ kind: "hold", start: t, end: t + HOLD_SECONDS });
  t += HOLD_SECONDS;
  return { beats, total: t, ringStart, ringEnd };
}
