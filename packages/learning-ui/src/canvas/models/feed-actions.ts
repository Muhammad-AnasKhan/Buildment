import type { Tone } from "../primitives/tones";
import type { ActorKind } from "../renderers/scene/types";
import {
  DEFAULT_DAILY_USERS,
  DEFAULT_FOLLOWS,
  DEFAULT_OPENS,
  FOLLOWS_PER_USER,
  PEAK_FACTOR,
  POSTS_PER_USER,
  PROFILE_VIEWS_PER_USER,
  SECONDS_PER_DAY,
} from "./feed-numbers";
import { withCommas } from "./picture-controls";

// 21.2 "Tap an action, see what it touches". The four things a Hikaya reader or
// author does, the blocks each one touches and how often a second at the
// busiest moment (chapter 21.1 numbers, 50 million daily users, 3 times the
// average). Pure data and functions, no React.
//
//   rate = daily users x actions per user a day / 86,400 x 3

export type ActionId = "feed" | "profile" | "publish" | "follow";
export type BlockId = "gateway" | "feed" | "post" | "timelines" | "posts" | "follows" | "queue" | "workers";

export const ACTION_IDS: readonly ActionId[] = ["feed", "profile", "publish", "follow"];
export const ACTION_LABELS: Record<ActionId, string> = { feed: "Open feed", profile: "Open profile", publish: "Publish a post", follow: "Follow" };

/** Actions per daily user per day. */
export const ACTION_PER_USER: Record<ActionId, number> = {
  feed: DEFAULT_OPENS,
  profile: PROFILE_VIEWS_PER_USER,
  publish: POSTS_PER_USER,
  follow: FOLLOWS_PER_USER,
};

/** A feed open reads a page of this many posts in one batch. */
export const PAGE_POSTS = 20;

export type Block = { id: BlockId; label: string; full: string; kind: ActorKind; x: number; y: number };

const COL = [66, 210, 354] as const;
const ROW = [122, 198, 274, 350] as const;

/** Eight blocks on a fixed grid: reads on the left, writes on the right. Labels are short enough for a 112 wide card. */
export const BLOCKS: readonly Block[] = [
  { id: "gateway", label: "Gateway", full: "Gateway", kind: "router", x: COL[1], y: ROW[0] },
  { id: "follows", label: "Follow store", full: "Follow store", kind: "database", x: COL[0], y: ROW[1] },
  { id: "feed", label: "Feed API", full: "Feed service", kind: "server", x: COL[1], y: ROW[1] },
  { id: "post", label: "Post API", full: "Post service", kind: "server", x: COL[2], y: ROW[1] },
  { id: "timelines", label: "Timelines", full: "Timeline cache and store", kind: "cache", x: COL[0], y: ROW[2] },
  { id: "posts", label: "Post store", full: "Post cache and store", kind: "database", x: COL[1], y: ROW[2] },
  { id: "queue", label: "Queue", full: "Queue", kind: "queue", x: COL[2], y: ROW[2] },
  { id: "workers", label: "Fan-out", full: "Fan-out workers", kind: "worker", x: COL[1], y: ROW[3] },
];

export type Hop = { from: BlockId; to: BlockId; /** Extra corners between the two block centres. */ via?: readonly [number, number][] };

/** Every link, in the direction a request travels. */
export const HOPS: readonly Hop[] = [
  { from: "gateway", to: "feed" },
  { from: "gateway", to: "post" },
  { from: "gateway", to: "follows" },
  { from: "feed", to: "timelines" },
  { from: "feed", to: "posts" },
  { from: "post", to: "posts" },
  { from: "post", to: "queue" },
  { from: "queue", to: "workers" },
  // Up the channel between the left and middle columns, so the line never runs under a card.
  { from: "workers", to: "follows", via: [[138, ROW[3]], [138, ROW[1]]] },
  { from: "workers", to: "timelines" },
];

export const hopKey = (h: Pick<Hop, "from" | "to">) => `${h.from}>${h.to}`;

/** The links each action uses. */
export const ACTION_HOPS: Record<ActionId, readonly string[]> = {
  feed: ["gateway>feed", "feed>timelines", "feed>posts"],
  profile: ["gateway>post", "post>posts"],
  publish: ["gateway>post", "post>posts", "post>queue", "queue>workers", "workers>follows", "workers>timelines"],
  follow: ["gateway>follows"],
};

export type ActionPill = {
  block: BlockId;
  /** The number on the pill. */
  value: number;
  /** The pill text, 15 characters or fewer: "17,361 reads/s". */
  text: string;
  /** For a screen reader: "Timelines: 17,361 list reads a second". */
  words: string;
  tone: Tone;
  /** A small tag on the card: where the number is explained later. */
  tag?: string;
};

/** Peak rate of an action a second, for the default 50 million daily users. */
export function peakRate(perUserPerDay: number, users = DEFAULT_DAILY_USERS): number {
  return ((users * perUserPerDay) / SECONDS_PER_DAY) * PEAK_FACTOR;
}

export const actionRate = (a: ActionId) => peakRate(ACTION_PER_USER[a]);

const rounded = (n: number, unit: number) => Math.round(n / unit) * unit;

function pill(block: BlockId, value: number, short: string, long: string, tone: Tone = "accent", tag?: string, textValue = value): ActionPill {
  const full = BLOCKS.find((b) => b.id === block)?.full ?? block;
  return { block, value, text: `${withCommas(textValue)} ${short}/s`, words: `${full}: ${withCommas(textValue)} ${long} a second`, tone, tag };
}

/** The pill on each block an action touches; blocks it does not touch have none. */
export function actionPills(a: ActionId): ActionPill[] {
  const rate = Math.round(actionRate(a));
  switch (a) {
    case "feed":
      return [
        pill("gateway", rate, "", "requests"),
        pill("feed", rate, "", "requests"),
        pill("timelines", rate, "reads", "list reads"),
        pill("posts", rate, "reads", "batch reads of 20 posts, " + withCommas(rounded(rate * PAGE_POSTS, 1000)) + " posts"),
      ];
    case "profile":
      return [pill("gateway", rate, "", "requests"), pill("post", rate, "", "requests"), pill("posts", rate, "reads", "author index reads")];
    case "publish":
      return [
        pill("gateway", rate, "", "requests"),
        pill("post", rate, "", "requests"),
        pill("timelines", rate * DEFAULT_FOLLOWS, "writes", "timeline writes if each author has 150 followers", "warn", "21.3", rounded(rate * DEFAULT_FOLLOWS, 1000)),
        pill("posts", rate, "writes", "writes"),
        pill("follows", rate, "reads", "follower lookups"),
        pill("queue", rate, "events", "events"),
        pill("workers", rate, "jobs", "jobs"),
      ];
    case "follow": {
      const writes = Math.round(2 * actionRate("follow"));
      return [pill("gateway", rate, "", "requests"), pill("follows", writes, "writes", "writes, one for each copy")];
    }
  }
}

/** Dots a second on a link: three speeds only. */
export function speedClass(rate: number): 1 | 2 | 3 {
  if (rate < 1_000) return 1;
  return rate <= 10_000 ? 2 : 3;
}

export const DOTS_PER_SECOND: Record<1 | 2 | 3, number> = { 1: 0.7, 2: 1.8, 3: 3.6 };

/** At most 38 characters. */
export function actionVerdict(a: ActionId): { text: string; tone: Tone } {
  switch (a) {
    case "feed":
      return { text: "Open feed: few blocks, very often", tone: "good" };
    case "profile":
      return { text: "Open profile: one read path", tone: "good" };
    case "publish":
      return { text: "Publish: many blocks, 350 a second", tone: "warn" };
    case "follow":
      return { text: "Follow: two small writes", tone: "good" };
  }
}

/** Two short lines under the picture that say what the pills count. */
export function actionCaption(a: ActionId): [string, string] {
  const rate = withCommas(Math.round(actionRate(a)));
  switch (a) {
    case "feed":
      return ["Each open reads 1 timeline, then 20 posts in one batch.", `${rate} list reads and ${withCommas(rounded(Math.round(actionRate(a)) * PAGE_POSTS, 1000))} posts a second.`];
    case "profile":
      return ["A profile reads one author's recent posts.", `${rate} reads a second from the author index.`];
    case "publish":
      return ["Each post is written once, queued, then fanned out.", `Timeline writes: ${withCommas(rounded(Math.round(actionRate(a)) * DEFAULT_FOLLOWS, 1000))} a second at 150 followers each.`];
    case "follow":
      return ["A follow is stored twice: by follower and by followee.", `${rate} follows a second is ${withCommas(Math.round(2 * actionRate(a)))} writes a second.`];
  }
}

/** The whole action in one sentence, for a screen reader. */
export function actionWords(a: ActionId): string {
  return `${ACTION_LABELS[a]}: ${withCommas(Math.round(actionRate(a)))} a second at peak. ${actionPills(a).map((p) => p.words).join(". ")}.`;
}
