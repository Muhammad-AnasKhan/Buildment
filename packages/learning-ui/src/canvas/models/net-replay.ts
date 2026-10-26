// The replay model behind the net-m1 terminal replays. Pure: no React, no
// clock, no randomness. A replay is a recorded lab session played one command
// at a time. For a step with a prediction the output stays hidden until the
// learner picks one of three options; then the real output appears.
//
// Rules in one place:
//   - A step is one command and its recorded output. runsOn says where the
//     learner types it: in the lab or on their own computer.
//   - Every output line is a real recorded line. A line that is only "..."
//     marks lines cut from a long output.
//   - At most two steps per replay have a prediction, with exactly three
//     options and one right answer.
//   - Next shows the next step. It waits while a prediction is unanswered.
//     Start over goes back to the first step.

export type RunsOn = "lab" | "computer";

export type ReplayPredict = {
  /** What the learner is asked before the output shows. */
  question: string;
  /** Exactly three short answers of similar length. */
  options: readonly [string, string, string];
  /** Index of the right option: 0, 1 or 2. */
  correct: 0 | 1 | 2;
};

export type ReplayStep = {
  runsOn: RunsOn;
  /** What was typed. A block of several lines is one step. */
  command: string;
  /** The recorded output, one line per line. A line that is only "..." marks a cut. */
  output: string;
  /** One line shown with the output: what to notice. */
  note: string;
  predict?: ReplayPredict;
};

export type ReplayData = { steps: readonly ReplayStep[] };

export const RUNS_ON_LABEL: Record<RunsOn, string> = {
  lab: "In the lab",
  computer: "On your computer",
};

export const CUT_LINE = "...";
export const MAX_PREDICTS = 2;
/** The longest option may be at most this many characters longer than the shortest. */
export const MAX_OPTION_SPREAD = 4;

/** Build the output text from its lines (keeps the data files easy to read). */
export const outputOf = (lines: readonly string[]): string => lines.join("\n");

export const outputLines = (output: string): string[] => output.split("\n");

export const commandLines = (command: string): string[] => command.split("\n");

/** What kind of line it is, so the card can colour it. The words PASS and FAIL stay in the text. */
export type LineKind = "pass" | "fail" | "cut" | "plain";

export function lineKind(line: string): LineKind {
  if (line === CUT_LINE) return "cut";
  if (line.startsWith("PASS")) return "pass";
  if (line.startsWith("FAIL")) return "fail";
  return "plain";
}

// ---------------------------------------------------------------- state

/** Steps started so far (1 to steps.length) and the pick made at each step (null: not picked). */
export type ReplayState = {
  shown: number;
  choices: readonly (number | null)[];
};

export function startState(data: ReplayData): ReplayState {
  return { shown: 1, choices: data.steps.map(() => null) };
}

/** The step the learner is on now (0-based index). */
export const currentIndex = (state: ReplayState): number => state.shown - 1;

/** True while the current step has a prediction the learner has not answered. */
export function awaitingPick(data: ReplayData, state: ReplayState): boolean {
  const i = currentIndex(state);
  return data.steps[i]?.predict !== undefined && state.choices[i] === null;
}

/** Whether the output of step i is visible: earlier steps always, the current one once it is answered. */
export function outputVisible(data: ReplayData, state: ReplayState, i: number): boolean {
  if (i < 0 || i >= state.shown) return false;
  if (i < currentIndex(state)) return true;
  return !awaitingPick(data, state);
}

export function canNext(data: ReplayData, state: ReplayState): boolean {
  return !awaitingPick(data, state) && state.shown < data.steps.length;
}

export function isLast(data: ReplayData, state: ReplayState): boolean {
  return state.shown >= data.steps.length;
}

/** Show the next step. Does nothing while a pick is waiting or at the last step. */
export function next(data: ReplayData, state: ReplayState): ReplayState {
  return canNext(data, state) ? { ...state, shown: state.shown + 1 } : state;
}

/** Pick option o (0 to 2) for the current step. Ignored if there is nothing to pick. */
export function choose(data: ReplayData, state: ReplayState, option: number): ReplayState {
  if (!awaitingPick(data, state)) return state;
  if (!Number.isInteger(option) || option < 0 || option > 2) return state;
  const i = currentIndex(state);
  return { ...state, choices: state.choices.map((c, k) => (k === i ? option : c)) };
}

export function startOver(data: ReplayData): ReplayState {
  return startState(data);
}

// ---------------------------------------------------------------- words

export type PickResult = { right: boolean; text: string };

/** The feedback for a pick: right, or not quite with the right answer. */
export function pickResult(predict: ReplayPredict, choice: number): PickResult {
  const right = choice === predict.correct;
  return {
    right,
    text: right ? `Right: ${predict.options[predict.correct]}.` : `Not quite. The recording shows ${predict.options[predict.correct]}.`,
  };
}

/** The step label: "Step 2 of 3, In the lab". */
export const stepLabel = (data: ReplayData, i: number): string => `Step ${i + 1} of ${data.steps.length}, ${RUNS_ON_LABEL[data.steps[i].runsOn]}`;

/** The command as one spoken line. */
const spokenCommand = (command: string) => commandLines(command).join("; ");

/** The sentence for the live region: the current step, and its output once it is visible. */
export function liveSummary(data: ReplayData, state: ReplayState): string {
  const i = currentIndex(state);
  const step = data.steps[i];
  const head = `${stepLabel(data, i)}. Command: ${spokenCommand(step.command)}.`;
  if (awaitingPick(data, state) && step.predict) {
    return `${head} The output is hidden. ${step.predict.question} Options: ${step.predict.options.join(", ")}.`;
  }
  const choice = state.choices[i];
  const verdict = step.predict && choice !== null ? ` ${pickResult(step.predict, choice).text}` : "";
  const spokenOutput = outputLines(step.output)
    .filter((line) => line.trim() !== "")
    .map((line) => (line === CUT_LINE ? "some lines left out" : line))
    .join(". ");
  return `${head}${verdict} Output: ${spokenOutput}. ${step.note}`;
}

// ---------------------------------------------------------------- checks

/** Problems with a replay's data. An empty list means the data follows the rules above. */
export function validateReplay(data: ReplayData): string[] {
  const problems: string[] = [];
  const { steps } = data;
  if (steps.length === 0) problems.push("no steps");
  const predicts = steps.filter((s) => s.predict).length;
  if (predicts > MAX_PREDICTS) problems.push(`${predicts} predictions, at most ${MAX_PREDICTS}`);
  steps.forEach((step, i) => {
    const at = `step ${i + 1}`;
    if (step.runsOn !== "lab" && step.runsOn !== "computer") problems.push(`${at}: runsOn must be lab or computer`);
    if (step.command.trim() === "") problems.push(`${at}: empty command`);
    if (step.output.trim() === "") problems.push(`${at}: empty output`);
    if (step.note.trim() === "") problems.push(`${at}: empty note`);
    if (step.note.includes("\n")) problems.push(`${at}: the note is one line`);
    if (outputLines(step.output).some((line) => line !== line.trimEnd())) problems.push(`${at}: trailing spaces in the output`);
    if (outputLines(step.output).length > 0 && outputLines(step.output)[0] === "" ) problems.push(`${at}: output starts with a blank line`);
    const p = step.predict;
    if (p) {
      if (p.options.length !== 3) problems.push(`${at}: a prediction has three options`);
      if (new Set(p.options).size !== p.options.length) problems.push(`${at}: options must differ`);
      if (![0, 1, 2].includes(p.correct)) problems.push(`${at}: correct must be 0, 1 or 2`);
      const sizes = p.options.map((o) => o.length);
      if (Math.max(...sizes) - Math.min(...sizes) > MAX_OPTION_SPREAD) problems.push(`${at}: options differ too much in length`);
      if (p.question.trim() === "") problems.push(`${at}: empty question`);
    }
  });
  return problems;
}
