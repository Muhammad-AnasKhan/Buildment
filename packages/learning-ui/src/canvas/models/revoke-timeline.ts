// 6.7 "Ban a seller: who notices, and when?": the seller is banned at t = 0
// and keeps sending requests. Worst case: the token was issued just before
// the ban. The gap is how long the seller still gets in.
//   sessions                       gap 0 s, 1 lookup per request
//   signed tokens only             gap = L, the token lifetime, no lookup
//   signed tokens plus a denylist  gap = the refresh time (10 s, made up),
//                                  no lookup per request, one list fetch per
//                                  service every 10 s
// Time runs on a log axis from 1 second to 60 minutes. Pure, no React.

export type LaneId = "sessions" | "tokens" | "denylist";

export const REFRESH_S = 10;
export const LIFETIME = { min: 1, max: 60, default: 15, snaps: [1, 5, 15, 60] } as const;
export const LIFETIME_LADDER: readonly number[] = Array.from({ length: LIFETIME.max }, (_, i) => i + 1);
export const AXIS = { from: 1, to: 3600 } as const;

export function clampLifetime(minutes: number): number {
  if (!Number.isFinite(minutes)) return LIFETIME.default;
  return Math.max(LIFETIME.min, Math.min(LIFETIME.max, Math.round(minutes)));
}

/** Seconds the seller still gets in, per design. */
export function gapSeconds(lane: LaneId, minutes: number): number {
  if (lane === "sessions") return 0;
  if (lane === "denylist") return REFRESH_S;
  return clampLifetime(minutes) * 60;
}

/** Position on the log axis, 0 at 1 second and 1 at 60 minutes. */
export function axisFraction(seconds: number): number {
  const s = Math.max(AXIS.from, Math.min(AXIS.to, Number.isFinite(seconds) ? seconds : AXIS.from));
  return Math.log(s / AXIS.from) / Math.log(AXIS.to / AXIS.from);
}

/** Rail position of a lifetime, 0 at 1 minute and 1 at 60 minutes. */
export function lifetimeToFraction(minutes: number): number {
  return Math.log(clampLifetime(minutes)) / Math.log(LIFETIME.max);
}

/** A rail position back to whole minutes, pulled onto 1, 5, 15 and 60 when close. */
export function lifetimeFromFraction(f: number): number {
  const clamped = Number.isFinite(f) ? Math.max(0, Math.min(1, f)) : 0;
  const minutes = clampLifetime(Math.exp(clamped * Math.log(LIFETIME.max)));
  for (const s of LIFETIME.snaps) if (Math.abs(lifetimeToFraction(s) - clamped) < 0.03) return s;
  return minutes;
}

/** When the seller's requests arrive, seconds after the ban: spread evenly on the log axis. */
export const REQUEST_TIMES: readonly number[] = Array.from({ length: 24 }, (_, i) => Math.round(Math.pow(AXIS.to, i / 23) * 10) / 10);

export type LaneDot = { at: number; accepted: boolean };

/** Each request, and whether the design still lets it in. */
export function laneDots(lane: LaneId, minutes: number): LaneDot[] {
  const gap = gapSeconds(lane, minutes);
  return REQUEST_TIMES.map((at) => ({ at, accepted: at < gap }));
}

export type Lane = { id: LaneId; name: string; lookups: string };

export const LANES: readonly Lane[] = [
  { id: "sessions", name: "Sessions", lookups: "1 lookup per request" },
  { id: "tokens", name: "Tokens", lookups: "no lookup" },
  { id: "denylist", name: "Token+list", lookups: "list fetched every 10 s" },
];

export function laneLabel(lane: LaneId, minutes: number): string {
  if (lane === "sessions") return "Sessions: refused at once";
  if (lane === "denylist") return `Denylist: within ${REFRESH_S} s`;
  return `Tokens alone: up to ${clampLifetime(minutes)} min`;
}

export type RevokeVerdict = { text: string; tone: "warn" | "bad" };

export function revokeVerdict(minutes: number): RevokeVerdict {
  const l = clampLifetime(minutes);
  if (l <= 5) return { text: "Short tokens: gap of 5 min or less", tone: "warn" };
  return { text: `Tokens alone: up to ${l} min after ban`, tone: "bad" };
}

/** A gap as words: "0 s", "10 s", "15 min". */
export function formatGap(seconds: number): string {
  return seconds < 60 ? `${seconds} s` : `${Math.round(seconds / 60)} min`;
}
