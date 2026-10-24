// 17.6 beat 2: step through the evening of 19:27 at Souq Express (a course
// composite). Five steps, two choices each. The better choice moves on; the
// worse one shows its cost and adds 5 minutes to the clock. Times are minutes
// after 19:00. Pure, no React.

import type { Tone } from "../primitives/tones";

export const PENALTY_MIN = 5;
export const ERROR_RATE = 6; // percent
export const ERRORS_BEGIN = 20; // 19:20, version 42 goes live
export const ROLLBACK_DONE = 33; // 19:33
export const ERRORS_GONE = 36; // 19:36
export const ALL_CLEAR = 51; // 19:51
export const AXIS = { from: 15, to: 80 }; // 19:15 to 20:20

export type Choice = { text: string; cost: string };

export type Step = {
  id: string;
  /** Minutes after 19:00 when the step starts, or null for "next day". */
  time: number | null;
  /** Two short lines of situation. */
  lines: [string, string];
  better: string;
  verdict: string;
  worse: Choice;
  /** Which slot (0 top, 1 bottom) the better choice sits in. */
  betterSlot: 0 | 1;
};

export const STEPS: readonly Step[] = [
  {
    id: "page",
    time: 27,
    lines: ["Page: order errors are at 6%.", "The budget burns 60 times too fast."],
    better: "Acknowledge and tell the team channel",
    verdict: "Acknowledged; the team knows",
    worse: { text: "Wait five minutes to see if it clears", cost: "Errors rose while you waited; +5 min" },
    betterSlot: 0,
  },
  {
    id: "roles",
    time: 29,
    lines: ["Three engineers join the channel", "and each starts trying fixes."],
    better: "Name one lead and one hand on the system",
    verdict: "One lead, one hand on the system",
    worse: { text: "Let everyone try fixes", cost: "Two changes collided; +5 min" },
    betterSlot: 1,
  },
  {
    id: "rollback",
    time: 32,
    lines: ["The deploy list shows v42 went live", "at 19:20, when the errors began."],
    better: "Roll back to v41",
    verdict: "Rolled back: errors fall to 0%",
    worse: { text: "Read the code to find the bug first", cost: "Reading code kept errors on; +5 min" },
    betterSlot: 0,
  },
  {
    id: "verify",
    time: 36,
    lines: ["The rollback finished at 19:33.", "Now the error rate reads 0%."],
    better: "Watch 15 min, then post the all-clear",
    verdict: "Verified before the all-clear",
    worse: { text: "Close the incident at once", cost: "A second spike was missed; +5 min" },
    betterSlot: 1,
  },
  {
    id: "learn",
    time: null,
    lines: ["The incident is over.", "How do we learn from it?"],
    better: "Write a blameless postmortem",
    verdict: "Postmortem about systems, not people",
    worse: { text: "Find who wrote the bad line", cost: "People learn to hide mistakes; +5 min" },
    betterSlot: 0,
  },
];

export const START_VERDICT = "Page at 19:27: choose a move";
export const PERFECT_VERDICT = "Errors gone 9 minutes after the page";
export const SLOW_VERDICT = "Resolved, but wrong picks cost time";

/** The state of one play: how many steps are done and which wrong choices were tried. */
export type Play = { done: number; tried: readonly boolean[]; last: "wrong" | "right" | null };

export const start = (): Play => ({ done: 0, tried: STEPS.map(() => false), last: null });

export const wrongCount = (play: Play, upTo = STEPS.length) => play.tried.slice(0, upTo).filter(Boolean).length;
export const penalty = (play: Play, upTo = STEPS.length) => wrongCount(play, upTo) * PENALTY_MIN;
export const finished = (play: Play) => play.done >= STEPS.length;

/** Pick the better or the worse choice of the current step. A repeat pick of a tried wrong choice does nothing. */
export function pick(play: Play, which: "better" | "worse"): Play {
  if (finished(play)) return play;
  if (which === "better") return { done: play.done + 1, tried: play.tried, last: "right" };
  if (play.tried[play.done]) return play;
  const tried = play.tried.map((t, i) => t || i === play.done);
  return { done: play.done, tried, last: "wrong" };
}

/** Minutes after 19:00 on the clock now (null on the next day). Wrong picks so far push it on. */
export function clock(play: Play): number | null {
  if (finished(play)) return null;
  const t = STEPS[play.done].time;
  return t === null ? null : t + penalty(play);
}

export function timeText(min: number): string {
  const total = 19 * 60 + min;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function clockText(play: Play): string {
  const now = clock(play);
  if (now === null) return "next day";
  const extra = penalty(play);
  return extra > 0 ? `${timeText(now)} (+${extra})` : timeText(now);
}

/** When the errors end: rollback done 3 minutes earlier, pushed by wrong picks in steps 1 to 3. Null until the rollback is chosen. */
export function errorsGone(play: Play): number | null {
  return play.done >= 3 ? ERRORS_GONE + penalty(play, 3) : null;
}
export function rollbackDone(play: Play): number | null {
  return play.done >= 3 ? ROLLBACK_DONE + penalty(play, 3) : null;
}
export function allClear(play: Play): number | null {
  return play.done >= 4 ? ALL_CLEAR + penalty(play, 4) : null;
}

export type ErrorLine = { begin: number; end: number | null; upTo: number };

/** The error rate drawn so far: 6% from 19:20 until `end` (or now), then 0%. */
export function errorLine(play: Play): ErrorLine {
  const now = finished(play) ? (allClear(play) ?? ERRORS_GONE) : (clock(play) ?? ERRORS_GONE);
  return { begin: ERRORS_BEGIN, end: errorsGone(play), upTo: errorsGone(play) ?? now };
}

export type Verdict = { text: string; tone: Tone };

export function verdictFor(play: Play): Verdict {
  if (finished(play)) {
    return wrongCount(play) === 0 ? { text: PERFECT_VERDICT, tone: "good" } : { text: SLOW_VERDICT, tone: "warn" };
  }
  if (play.last === "wrong") return { text: STEPS[play.done].worse.cost, tone: "warn" };
  if (play.done === 0) return { text: START_VERDICT, tone: "accent" };
  return { text: STEPS[play.done - 1].verdict, tone: "good" };
}

/** Minutes from the page (19:27) to the errors ending. */
export const minutesToClear = (play: Play) => {
  const gone = errorsGone(play);
  return gone === null ? null : gone - STEPS[0].time!;
};

export function summaryLines(play: Play): [string, string] {
  const gone = errorsGone(play) ?? ERRORS_GONE;
  const wrong = wrongCount(play);
  return [`Paged 19:27, errors gone ${timeText(gone)} (${gone - 27} min)`, wrong === 0 ? "No wrong picks" : `${wrong} wrong ${wrong === 1 ? "pick" : "picks"}, ${penalty(play)} min lost`];
}
