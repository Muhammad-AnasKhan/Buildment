// 19.5 beat 2: for DNS policies the time users are dark is the health check
// time plus the DNS TTL; anycast removes the TTL. The survivor receives the
// failed region's users. Made-up course numbers: a health check of 30 s x 3
// failures (90 s), a TTL of 60 s or 300 s. Round trips come from the course
// latency table; Singapore to NA East is not in it, so it is shown as "farther".

export type PolicyId = "latency" | "location" | "failover" | "anycast";
export type GroupId = "europe" | "na" | "asia";
export type RegionId = "eu" | "na";
export type Ttl = 60 | 300;

export const DETECT_SECONDS = 90;
export const TTLS: readonly Ttl[] = [60, 300];
export const DEFAULT_TTL: Ttl = 60;
export const DEFAULT_POLICY: PolicyId = "latency";

export const GROUPS: readonly { id: GroupId; name: string }[] = [
  { id: "europe", name: "Europe" },
  { id: "na", name: "NA East" },
  { id: "asia", name: "Singapore" },
];
export const REGIONS: readonly { id: RegionId; name: string }[] = [
  { id: "eu", name: "EU West" },
  { id: "na", name: "NA East" },
];
export const POLICIES: readonly { id: PolicyId; label: string; full: string }[] = [
  { id: "latency", label: "Latency", full: "Latency routing" },
  { id: "location", label: "Location", full: "Location routing, by country" },
  { id: "failover", label: "Failover", full: "Failover routing, EU West first" },
  { id: "anycast", label: "Anycast", full: "Anycast, one address announced from both regions" },
];

export const regionName = (r: RegionId) => REGIONS.find((x) => x.id === r)?.name ?? r;
export const groupName = (g: GroupId) => GROUPS.find((x) => x.id === g)?.name ?? g;
export const otherRegion = (r: RegionId): RegionId => (r === "eu" ? "na" : "eu");

/** The region a group uses while both regions are healthy. */
export function homeRegion(policy: PolicyId, group: GroupId): RegionId {
  if (policy === "failover") return "eu";
  return group === "na" ? "na" : "eu";
}

/** The round trip from a group to a region, as words for a status pill. */
export function tripText(group: GroupId, region: RegionId): { text: string; ms: number | null } {
  if (group === "europe") return region === "eu" ? { text: "near", ms: 0 } : { text: "80 ms", ms: 80 };
  if (group === "na") return region === "na" ? { text: "near", ms: 0 } : { text: "80 ms", ms: 80 };
  return region === "eu" ? { text: "160 ms", ms: 160 } : { text: "farther", ms: null };
}

/** Seconds the groups on a failed region are dark: detection, plus the cache for DNS policies. */
export const darkSeconds = (policy: PolicyId, ttl: Ttl) => DETECT_SECONDS + (policy === "anycast" ? 0 : ttl);

export type GroupState =
  | { kind: "ok"; region: RegionId }
  | { kind: "dark"; region: RegionId }
  | { kind: "moved"; region: RegionId }
  | { kind: "none" };

/** Where a group is `seconds` after the failure (Infinity for the settled state). */
export function groupState(policy: PolicyId, ttl: Ttl, failed: ReadonlySet<RegionId>, group: GroupId, seconds: number): GroupState {
  const home = homeRegion(policy, group);
  if (!failed.has(home)) return { kind: "ok", region: home };
  const alt = otherRegion(home);
  if (failed.has(alt)) return { kind: "none" };
  return seconds < darkSeconds(policy, ttl) ? { kind: "dark", region: home } : { kind: "moved", region: alt };
}

/** Groups that sit on a failed region (and so have to move). */
export function affectedGroups(policy: PolicyId, failed: ReadonlySet<RegionId>): GroupId[] {
  return GROUPS.filter((g) => failed.has(homeRegion(policy, g.id))).map((g) => g.id);
}

/** How many groups a healthy region serves at a given moment. */
export function served(states: readonly { id: GroupId; state: GroupState }[], region: RegionId): number {
  return states.filter((s) => s.state.kind !== "none" && s.state.kind !== "dark" && s.state.region === region).length;
}

export type Verdict = { text: string; tone: "good" | "warn" | "bad" | "accent" };

export function verdictFor(policy: PolicyId, ttl: Ttl, failed: ReadonlySet<RegionId>): Verdict {
  if (failed.size === 0) return { text: "Pick a policy, then fail a region", tone: "accent" };
  if (failed.size === 2) return { text: "No region left to route to", tone: "bad" };
  const hit = affectedGroups(policy, failed);
  if (hit.length === 0) return { text: "Nobody was on it; no one moves", tone: "good" };
  const secs = darkSeconds(policy, ttl);
  if (policy === "anycast") return { text: `Moved after ${secs} s; no cache to wait`, tone: "good" };
  const to = regionName(otherRegion(homeRegion(policy, hit[0])));
  const who = hit.length === GROUPS.length ? "Everyone" : groupName(hit[0]);
  return { text: `${who} reaches ${to} after ${secs} s`, tone: ttl === 300 ? "bad" : "warn" };
}
