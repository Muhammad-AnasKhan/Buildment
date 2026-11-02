// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import type { CareerTier } from "../api/gamification";

// The permanent career ladder: Intern → Junior → Mid → Senior → Staff → Principal. It is mastery-gated
// (completed courses + a minimum average quiz score), NOT XP, so a senior title means demonstrated
// competence rather than time spent. The tier a learner reaches is permanent (highest ever), and this
// module stays pure so the server and the web app share one source of truth.

export const CAREER_TIERS: CareerTier[] = ["INTERN", "JUNIOR", "MID", "SENIOR", "STAFF", "PRINCIPAL"];

export const CAREER_TIER_LABELS: Record<CareerTier, string> = {
  INTERN: "Intern",
  JUNIOR: "Junior",
  MID: "Mid",
  SENIOR: "Senior",
  STAFF: "Staff",
  PRINCIPAL: "Principal",
};

export type CareerMastery = {
  /** Enrollments with lifecycle COMPLETED (not dropped). */
  completedCourses: number;
  /** Average weighted score (0–100) across completed chapters with a score. */
  avgScore: number;
};

/** What each tier requires: completed courses and a minimum average quiz score (0–100). */
export const CAREER_REQUIREMENTS: Record<CareerTier, { courses: number; minScore: number }> = {
  INTERN: { courses: 0, minScore: 0 },
  JUNIOR: { courses: 2, minScore: 70 },
  MID: { courses: 5, minScore: 72 },
  SENIOR: { courses: 10, minScore: 75 },
  STAFF: { courses: 15, minScore: 78 },
  PRINCIPAL: { courses: 20, minScore: 80 },
};

export function careerTierIndex(tier: CareerTier): number {
  return CAREER_TIERS.indexOf(tier);
}

export function nextCareerTier(tier: CareerTier): CareerTier | null {
  const index = careerTierIndex(tier);
  return index >= 0 && index < CAREER_TIERS.length - 1 ? CAREER_TIERS[index + 1]! : null;
}

/** Highest tier the learner's current verified mastery qualifies for. Requirements are non-decreasing. */
export function careerTierForMastery(mastery: CareerMastery): CareerTier {
  let best: CareerTier = "INTERN";
  for (const tier of CAREER_TIERS) {
    const requirement = CAREER_REQUIREMENTS[tier];
    if (mastery.completedCourses >= requirement.courses && mastery.avgScore >= requirement.minScore) {
      best = tier;
    } else {
      break;
    }
  }
  return best;
}