import type { LeagueTier } from "../api/gamification.js";

// League tiers for the global weekly XP board, from lowest to highest. Pure helpers here so the
// server and the web app share one source of truth for badge order and zone math.

export const LEAGUE_TIER_ORDER: LeagueTier[] = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];

/** Display names for badges and banners. */
export const LEAGUE_TIER_LABELS: Record<LeagueTier, string> = {
  BRONZE: "Bronze",
  SILVER: "Silver",
  GOLD: "Gold",
  PLATINUM: "Platinum",
  DIAMOND: "Diamond",
};

export function nextLeagueTier(tier: LeagueTier): LeagueTier | null {
  const index = LEAGUE_TIER_ORDER.indexOf(tier);
  return index >= 0 && index < LEAGUE_TIER_ORDER.length - 1 ? LEAGUE_TIER_ORDER[index + 1]! : null;
}

export function prevLeagueTier(tier: LeagueTier): LeagueTier | null {
  const index = LEAGUE_TIER_ORDER.indexOf(tier);
  return index > 0 ? LEAGUE_TIER_ORDER[index - 1]! : null;
}

/**
 * Ranks at or better than this promote at the weekly reset. Tiny leagues (fewer than 3) promote
 * nobody: with two people, "top 10%" would be a coin flip every week.
 */
export function leaguePromotionZone(groupSize: number): number {
  if (groupSize < 3) return 0;
  return Math.max(1, Math.ceil(groupSize * 0.1));
}

/**
 * Ranks at or worse than this demote. Leagues under 10 people have no demotion zone — a small
 * board should feel safe, and loss aversion needs enough peers to be meaningful.
 */
export function leagueDemotionZone(groupSize: number): number {
  if (groupSize < 10) return groupSize + 1;
  return Math.min(groupSize, Math.floor(groupSize * 0.8) + 1);
}
