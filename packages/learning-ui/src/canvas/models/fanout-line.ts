import { withCommas } from "./picture-controls";
import { FANOUT_PLAN, PEAK_FACTOR, SECONDS_PER_DAY, SLOW_LOOKUP, SLOW_SHARE_LIMIT, ACCOUNTS } from "./feed-numbers";

// 21.3 "Drag the line between push and pull". Hikaya's accounts in five groups
// (a made-up composite shaped like a real social graph) and one line across
// them: accounts left of the line are pushed (their posts are copied into
// every follower's timeline), accounts right of it are pulled (read when
// someone looks). Pure functions, no React.
//
//   timeline writes a second at peak = sum over pushed groups of
//                                      (accounts x posts a day x followers) / 86,400 x 3
//   lookups per feed open            = 1 + sum over pulled groups of follows per reader
//   feed opens that meet a slow one  = 1 - 0.99 ^ lookups

export type Group = {
  id: string;
  name: string;
  accounts: number;
  /** Followers of each account in the group. */
  followers: number;
  /** Posts a day for each account. */
  postsPerDay: number;
  /** The biggest account in the group, for the slowest-post caption. */
  biggest: number;
};

/** Left to right: followers rise. */
export const GROUPS: readonly Group[] = [
  { id: "everyday", name: "Everyday", accounts: 80_000_000, followers: 100, postsPerDay: 0.11, biggest: 100 },
  { id: "local", name: "Local", accounts: 4_000_000, followers: 1_000, postsPerDay: 0.25, biggest: 1_000 },
  { id: "popular", name: "Popular", accounts: 100_000, followers: 10_000, postsPerDay: 1, biggest: 10_000 },
  { id: "big", name: "Big", accounts: 10_000, followers: 100_000, postsPerDay: 2, biggest: 100_000 },
  { id: "celebrity", name: "Celebrity", accounts: 1_000, followers: 1_000_000, postsPerDay: 4, biggest: 20_000_000 },
];

/** Follow edges of a group: accounts x followers. */
export const edgesOf = (g: Group) => g.accounts * g.followers;
/** Timeline writes a day if the group is pushed. */
export const writesPerDay = (g: Group) => g.accounts * g.postsPerDay * g.followers;
/** Accounts a reader follows in this group, on average (edges over all accounts). */
export const followsPerReader = (g: Group) => edgesOf(g) / ACCOUNTS;

/** The line's positions: how many groups, counted from the left, are pushed. 5 pushes everyone, 0 pulls everyone. */
export const LINE_STOPS = [0, 1, 2, 3, 4, 5] as const;
export const DEFAULT_PUSHED = 5;

/** The gauges' full scales. */
export const WRITE_SCALE = 330_000;
export const READ_SCALE = 1;

export type FanoutResult = {
  pushed: number;
  writesPerSecond: number;
  /** Writes against the plan: 1 is 100%. */
  planShare: number;
  lookups: number;
  /** Share of feed opens that meet at least one slow lookup, 0 to 1. */
  slowShare: number;
  /** Seconds the biggest pushed account's post takes to land at the plan rate, or null when nothing is pushed. */
  slowestSeconds: number | null;
  writesOver: boolean;
  readsOver: boolean;
};

export function fanout(pushed: number): FanoutResult {
  const n = Math.max(0, Math.min(GROUPS.length, Math.round(pushed)));
  const pushedGroups = GROUPS.slice(0, n);
  const pulledGroups = GROUPS.slice(n);
  const writesPerSecond = (pushedGroups.reduce((a, g) => a + writesPerDay(g), 0) / SECONDS_PER_DAY) * PEAK_FACTOR;
  const lookups = 1 + Math.round(pulledGroups.reduce((a, g) => a + followsPerReader(g), 0));
  const slowShare = 1 - Math.pow(1 - SLOW_LOOKUP, lookups);
  const biggest = pushedGroups.reduce((a, g) => Math.max(a, g.biggest), 0);
  const planShare = writesPerSecond / FANOUT_PLAN;
  return {
    pushed: n,
    writesPerSecond,
    planShare,
    lookups,
    slowShare,
    slowestSeconds: n === 0 ? null : biggest / FANOUT_PLAN,
    writesOver: planShare > 1,
    readsOver: slowShare > SLOW_SHARE_LIMIT,
  };
}

export type Verdict = { text: string; tone: "good" | "bad" };

/** At most 38 characters. */
export function fanoutVerdict(r: FanoutResult): Verdict {
  if (r.writesOver && r.readsOver) return { text: "Both over: widen the budget", tone: "bad" };
  if (r.writesOver) return { text: "Writes too heavy: pull more accounts", tone: "bad" };
  if (r.readsOver) return { text: "Reads too slow: push more accounts", tone: "bad" };
  return { text: "Both within limits: the hybrid works", tone: "good" };
}

const shortCount = (n: number) => (n >= 1_000_000 ? `${n / 1_000_000}M` : n >= 1_000 ? `${n / 1_000}K` : String(n));

/** Short stop labels under the rail: "none", "1M+", ... "all". Two lines: "pull" and the threshold. */
export function stopLabel(pushed: number): [string, string] {
  if (pushed >= GROUPS.length) return ["pull", "none"];
  if (pushed <= 0) return ["pull", "all"];
  return ["pull", `${shortCount(GROUPS[pushed].followers)}+`];
}

/** Where the line stands, in words. */
export function lineName(pushed: number): string {
  if (pushed >= GROUPS.length) return "push everyone";
  if (pushed <= 0) return "pull everyone";
  return `pull accounts with ${withCommas(GROUPS[pushed].followers)} followers or more`;
}

export const percent = (share: number) => `${withCommas(Math.round(share * 100))}%`;
/** One decimal, as the chapter's table prints it: 1.0%, 19.0%, 78.1%. */
export const percentOne = (share: number) => `${(Math.round(share * 1000) / 10).toFixed(1)}%`;

/** A rate on the write gauge: "308,333 /s". */
export const writesText = (n: number) => `${withCommas(n)} /s`;

/** The slowest post as a short caption value: "133 s", "0.7 s", "0.07 s", "under 0.01 s", "none". */
export function slowestText(seconds: number | null): string {
  if (seconds === null) return "none, nothing is pushed";
  if (seconds >= 10) return `${Math.round(seconds)} s`;
  if (seconds >= 0.1) return `${(Math.round(seconds * 10) / 10).toString()} s`;
  if (seconds >= 0.01) return `${(Math.round(seconds * 100) / 100).toString()} s`;
  return "under 0.01 s";
}

/** What a screen reader says for the line. */
export function fanoutValueText(r: FanoutResult): string {
  return `${lineName(r.pushed)}: ${withCommas(r.writesPerSecond)} writes a second, ${Math.round(r.planShare * 100)} percent of plan, ${r.lookups} ${r.lookups === 1 ? "lookup" : "lookups"} per feed open, ${Math.round(r.slowShare * 100)} percent of feed opens meet a slow lookup`;
}

/** The group's count on its card: "80M", "100K". */
export const accountsText = shortCount;
