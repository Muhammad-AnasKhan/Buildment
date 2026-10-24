import type { DesignSpec, DesignStep } from "./design-stepper";

// 28.2 "Six boxes fill 45 minutes". The round is six time boxes, each ending
// with one thing said or drawn. Minutes spent drawing the sketch come out of
// the deep dive. The minute counts are the course's plan (chapter 28.2), not
// a rule from any company. Pure data for the house design stepper.
//
//   plan      = clarify 5 + estimate 5 + sketch 10 + deep dive 15 + trade-offs and failure 7 + wrap-up 3 = 45
//   long sketch (+8): clock at the end of the sketch = 5 + 5 + 18 = 28
//   deep dive left    = 45 - 28 - 7 - 3 = 7  (15 - 8)

export const ROUND_MINUTES = 45;
export const SKETCH_EXTRA = 8;
export const BOXES = [
  { id: "clarify", minutes: 5 },
  { id: "estimate", minutes: 5 },
  { id: "sketch", minutes: 10 },
  { id: "dive", minutes: 15 },
  { id: "cost", minutes: 7 },
  { id: "wrapup", minutes: 3 },
] as const;

/** The minute on the clock at the end of box `index` (0 to 5), with the sketch drawn long or not. */
export function minuteAt(index: number, longSketch = false): number {
  let sum = 0;
  for (let i = 0; i <= index && i < BOXES.length; i++) sum += BOXES[i].minutes + (longSketch && BOXES[i].id === "sketch" ? SKETCH_EXTRA : 0);
  return sum;
}

/** Minutes left for the deep dive when the sketch runs long and the other boxes keep their time. */
export function diveMinutes(longSketch: boolean): number {
  return ROUND_MINUTES - minuteAt(2, longSketch) - BOXES[4].minutes - BOXES[5].minutes;
}

const CLOCK = { id: "clock", label: "Clock", kind: "clock", x: 62, y: 100 } as const;
const BOARD = { id: "board", label: "Board", kind: "note", x: 210, y: 100 } as const;
const ASK = { id: "ask", label: "Interviewer", kind: "user", x: 358, y: 100 } as const;
const COL_X = 210;
const ROWS = [190, 218, 246, 274, 302] as const;

const minutePill = (index: number) => ({ text: `minute ${minuteAt(index)}`, tone: "accent" as const });
const flow = (label: string) => [{ path: ["board", "ask"], label, tone: "accent" as const }];

/** The interview stepper: six steps, one chip added to the board in each of the first five. */
export function interviewDesign(): DesignSpec {
  const steps: DesignStep[] = [
    {
      id: "clarify",
      title: "Clarify",
      patch: {
        actors: [CLOCK, BOARD, ASK],
        links: [
          { id: "clock-board", from: "clock", to: "board" },
          { id: "board-ask", from: "board", to: "ask" },
        ],
        tags: [{ id: "c1", text: "create + open, no edits", x: COL_X, y: ROWS[0], tone: "accent" }],
        status: { clock: minutePill(0), board: { text: "scope", tone: "accent" }, ask: { text: "listening", tone: "accent" } },
        flows: flow("4 questions"),
      },
      verdict: { text: "Minute 5: scope agreed", tone: "good" },
      says: "Four questions fix what to build and what to leave out.",
      hint: "Tap Next to move to the next box.",
    },
    {
      id: "numbers",
      title: "Numbers",
      patch: {
        tags: [{ id: "c2", text: "100,000 opens/s, 9 TB", x: COL_X, y: ROWS[1], tone: "accent" }],
        status: { clock: minutePill(1), board: { text: "numbers", tone: "accent" }, ask: null },
        flows: flow("sums + units"),
      },
      verdict: { text: "Minute 10: opens drive it", tone: "good" },
      says: "Say each sum with its unit and name the driving number.",
      hint: "Tap Next, or tap any box above.",
    },
    {
      id: "sketch",
      title: "Sketch",
      patch: {
        tags: [{ id: "c3", text: "app > cache > store", x: COL_X, y: ROWS[2], tone: "accent" }],
        status: { clock: minutePill(2), board: { text: "4 boxes", tone: "accent" } },
        flows: flow("main path"),
      },
      verdict: { text: "Minute 20: main path drawn", tone: "good" },
      says: "Draw the path of each main action and give each box one job.",
      hint: "Press the button, or tap the clock, to draw longer.",
      action: {
        toggle: true,
        phases: [
          { button: `Draw ${SKETCH_EXTRA} min longer`, target: "clock" },
          {
            button: "Back to 10 min",
            target: "clock",
            patch: {
              tags: [{ id: "left", text: `dive left: ${diveMinutes(true)} min`, x: 62, y: 160, tone: "bad" }],
              status: { clock: { text: `minute ${minuteAt(2, true)}`, tone: "bad" } },
              mark: { clock: "bad" },
            },
            verdict: { text: `Sketch ran long: dive gets ${diveMinutes(true)} min`, tone: "bad" },
            says: `${SKETCH_EXTRA} more minutes of drawing come out of the deep dive.`,
          },
        ],
      },
    },
    {
      id: "dive",
      title: "Dive",
      patch: {
        tags: [
          { id: "c4", text: "dive: cache, 90% hits", x: COL_X, y: ROWS[3], tone: "accent" },
          { id: "plan", text: `dive: ${BOXES[3].minutes} min`, x: 62, y: 160, tone: "good" },
        ],
        status: { clock: minutePill(3), board: { text: "1 deep dive", tone: "accent" } },
        flows: flow("one dive"),
      },
      verdict: { text: "Minute 35: one dive, done", tone: "good" },
      says: "One hard part, with options and the number that chose it.",
      hint: "The plan gives the dive 15 minutes.",
    },
    {
      id: "cost",
      title: "Cost",
      patch: {
        remove: ["plan"],
        tags: [{ id: "c5", text: "302 costs a hop; cache restart", x: COL_X, y: ROWS[4], tone: "accent" }],
        status: { clock: minutePill(4), board: { text: "cost + failure", tone: "accent" }, ask: { text: "asks why", tone: "warn" } },
        flows: flow("cost + failure"),
      },
      verdict: { text: "Minute 42: cost and failure named", tone: "good" },
      says: "One choice with its cost and switch point, then one failure.",
      hint: "Tap Next for the last box.",
    },
    {
      id: "wrapup",
      title: "Wrap-up",
      patch: {
        status: { clock: minutePill(5), board: { text: "done", tone: "good" }, ask: { text: "can score it", tone: "good" } },
        flows: flow("summary"),
      },
      verdict: { text: "Minute 45: three-sentence summary", tone: "good" },
      says: "Three sentences: what you built, the driver, what next.",
      hint: "Tap Start over to run the round again.",
    },
  ];
  return { width: 420, height: 330, steps };
}
