import { withCommas } from "./picture-controls";

// 21.4 "Drag how much age counts". A ranking score mixes closeness, popularity
// and age, and the half-life decides how fast age counts. A teaching formula:
// real rankers use trained models. Pure functions, no React.
//
//   score = closeness x (1 + ln(1 + likes)) x 0.5 ^ (age in hours / half-life in hours)

export const HALF_LIVES = [1, 3, 6, 12, 24, 48] as const;
export const DEFAULT_HALF_LIFE = 6;

export type RankPost = {
  id: string;
  name: string;
  /** Who the author is to the reader, for the card. Empty when the name says it. */
  role: string;
  /** How close the reader is to the author, 0 to 1. */
  closeness: number;
  likes: number;
  ageHours: number;
};

/** Made up. Dina is a close friend, Karim a star, the rest sit between. */
export const POSTS: readonly RankPost[] = [
  { id: "dina", name: "Dina", role: "close friend", closeness: 1, likes: 6, ageHours: 1 },
  { id: "karim", name: "Karim", role: "star", closeness: 0.5, likes: 400_000, ageHours: 20 },
  { id: "bakery", name: "Rafa Bakery", role: "", closeness: 0.3, likes: 40, ageHours: 5 },
  { id: "omar", name: "Omar", role: "cousin", closeness: 0.8, likes: 3, ageHours: 9 },
  { id: "news", name: "Daily News", role: "", closeness: 0.4, likes: 2_000, ageHours: 3 },
];

/** The popularity term: starts at 1 so a new post with no likes is not buried. */
export const engagement = (likes: number) => 1 + Math.log(1 + Math.max(0, likes));

/** The age term: 1 for a brand new post, 0.5 after one half-life. */
export const freshness = (ageHours: number, halfLifeHours: number) => Math.pow(0.5, Math.max(0, ageHours) / halfLifeHours);

export type Ranked = RankPost & {
  engagement: number;
  freshness: number;
  score: number;
  /** 0 is first. */
  rank: number;
};

/** The five posts, best first. Ties keep the order of POSTS. */
export function rankPosts(halfLifeHours: number, posts: readonly RankPost[] = POSTS): Ranked[] {
  return posts
    .map((p) => {
      const e = engagement(p.likes);
      const f = freshness(p.ageHours, halfLifeHours);
      return { ...p, engagement: e, freshness: f, score: p.closeness * e * f, rank: 0 };
    })
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({ ...p, rank: i }));
}

export type Verdict = { text: string; tone: "good" | "warn" };

/** At most 38 characters. */
export function rankVerdict(top: Ranked): Verdict {
  if (top.id === "dina") return { text: "Fresh friends lead", tone: "good" };
  if (top.id === "news") return { text: "Popular recent news leads", tone: "warn" };
  if (top.id === "karim") return { text: "Old but popular posts climb", tone: "warn" };
  return { text: `${top.name} leads`, tone: "warn" };
}

export const hoursText = (h: number) => `${h} ${h === 1 ? "hour" : "hours"}`;
export const score2 = (n: number) => n.toFixed(2);
export const likesText = (n: number) => `${withCommas(n)} ${n === 1 ? "like" : "likes"}`;

/** First names, for the order sentence: "Dina", "Daily News", "Karim", "Omar", "Bakery". */
const SHORT: Record<string, string> = { dina: "Dina", karim: "Karim", bakery: "Bakery", omar: "Omar", news: "Daily News" };
export const shortName = (id: string) => SHORT[id] ?? id;

/** What a screen reader says for the rail: "half-life 12 hours: Daily News first, then Dina, Karim, Omar, Bakery". */
export function rankValueText(halfLifeHours: number, ranked: readonly Ranked[]): string {
  const names = ranked.map((p) => shortName(p.id));
  return `half-life ${hoursText(halfLifeHours)}: ${names[0]} first, then ${names.slice(1).join(", ")}`;
}
