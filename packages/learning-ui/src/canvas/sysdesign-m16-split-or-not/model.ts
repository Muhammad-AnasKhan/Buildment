// 16.2 beat 5: weigh team size, blocked releases and boundary clarity. A course
// rule of thumb that adds points (Fowler's "Monolith First" is the only anchor),
// not a law. Pure, no React.

import type { Tone } from "../primitives/tones";

export const TEAM_STOPS = [3, 8, 15, 30, 60, 120] as const;
export const COLLISION_STOPS = [0, 1, 3, 6, 10] as const;
export const CLARITY_STOPS = [0, 1, 2] as const;
export const CLARITY_NAMES = ["New idea", "Mostly clear", "Stable for a year"] as const;
export const DEFAULTS = { team: 15, collisions: 3, clarity: 1 } as const;
export const MAX_POINTS = { team: 3, collisions: 3, clarity: 2 } as const;
export const MAX_TOTAL = MAX_POINTS.team + MAX_POINTS.collisions + MAX_POINTS.clarity;

export type Shape = "monolith" | "modular" | "split";

export function teamPoints(people: number): number {
  if (people <= 8) return 0;
  if (people <= 15) return 1;
  if (people <= 30) return 2;
  return 3;
}

export function collisionPoints(releases: number): number {
  if (releases <= 1) return 0;
  if (releases <= 3) return 1;
  if (releases <= 6) return 2;
  return 3;
}

export function clarityPoints(clarity: number): number {
  return Math.max(0, Math.min(2, Math.round(clarity)));
}

export type Weigh = {
  team: number;
  collisions: number;
  clarity: number;
  total: number;
  shape: Shape;
  /** Unclear walls held the answer back from "split". */
  capped: boolean;
  verdict: { text: string; tone: Tone };
};

export function weigh(people: number, releases: number, clarity: number): Weigh {
  const team = teamPoints(people);
  const collisions = collisionPoints(releases);
  const walls = clarityPoints(clarity);
  const total = team + collisions + walls;
  const capped = walls === 0 && total >= 5;
  const shape: Shape = capped ? "modular" : total <= 1 ? "monolith" : total <= 4 ? "modular" : "split";
  const verdict: Weigh["verdict"] = capped
    ? { text: "Walls unclear: stay modular", tone: "warn" }
    : shape === "monolith"
      ? { text: "Stay one monolith", tone: "good" }
      : shape === "modular"
        ? { text: "Modular monolith, hard walls", tone: "accent" }
        : { text: "Split the parts that hurt", tone: "accent" };
  return { team, collisions, clarity: walls, total, shape, capped, verdict };
}

const plural = (n: number) => `${n} point${n === 1 ? "" : "s"}`;

export const teamValueText = (people: number) => `team size ${people} people, ${plural(teamPoints(people))}`;
export const collisionValueText = (releases: number) => `${releases} releases waited for another team last month, ${plural(collisionPoints(releases))}`;
export const clarityValueText = (clarity: number) => `boundaries: ${CLARITY_NAMES[clarityPoints(clarity)].toLowerCase()}, ${plural(clarityPoints(clarity))}`;
