// Small pieces the generated drills of modules 3 and 9 share: one question
// shape (a prompt, a subject, a few options, the index of the right one and the
// feedback in words) and the seeded helpers that make a set reproducible.
// Pure: same set number, same questions.

import { DRILL_SIZE, seedForSet, seededRandom } from "./net-address";

/** One multiple-choice question of a generated set. */
export type DrillItem = {
  /** A short name for the kind of question, for tests and the live summary. */
  kind: string;
  /** What is being asked, one sentence. */
  prompt: string;
  /** The thing to work on, shown large: an address with its prefix, a form, a host count. */
  subject: string;
  /** Two or three answers in display order. */
  options: string[];
  /** Index of the right option. */
  answer: number;
  /** The feedback after an answer: the working, in words. */
  explain: string;
};

export { DRILL_SIZE };

/** The random source of one set. `salt` keeps the drills of different modes apart. */
export function drillRandom(setNumber: number, salt: number): () => number {
  return seededRandom((seedForSet(setNumber) ^ salt) >>> 0);
}

/** Fisher-Yates with a given random source. */
export function shuffleWith<T>(items: readonly T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** A whole number from `low` to `high`, both included. */
export function between(rand: () => number, low: number, high: number): number {
  return low + Math.floor(rand() * (high - low + 1));
}

/**
 * Put the right answer among its wrong options, in a seeded order. Wrong
 * options equal to the answer, or to each other, are skipped; the first
 * `count - 1` that remain are used.
 */
export function withOptions(kind: string, prompt: string, subject: string, answer: string, wrong: readonly string[], explain: string, rand: () => number, count = 3): DrillItem {
  const seen = new Set<string>([answer]);
  const chosen: string[] = [];
  for (const w of wrong) {
    if (seen.has(w)) continue;
    seen.add(w);
    chosen.push(w);
    if (chosen.length === count - 1) break;
  }
  const options = shuffleWith([answer, ...chosen], rand);
  return { kind, prompt, subject, options, answer: options.indexOf(answer), explain };
}

/** True when the chosen option is the right one. */
export function checkDrillChoice(item: DrillItem, choice: number): boolean {
  return choice === item.answer;
}
