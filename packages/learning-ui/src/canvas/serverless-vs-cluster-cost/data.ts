import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// AI Engineering Interview course, chapter 10.4 "Deployment: serverless or
// Kubernetes". Every price is the chapter's own example price, not any
// provider's. The defaults are Wadi Labs' runbook bot: 2,000 questions a day of
// about 4 seconds each, on a function with 1 GB of memory. See spec.md.

export type CostInputs = {
  questionsPerDay: number;
  /** Seconds each question runs, almost all of it waiting on the model. */
  secondsPerQuestion: number;
  /** Memory given to each serverless function, in GB. */
  memoryGb: number;
};

/** Example price: dollars per second a 1 GB function runs. Scales with memory. */
export const SERVERLESS_PER_GB_SECOND = 0.0001;
/** Example price: dollars per container copy per day (0.05 an hour). */
export const COPY_PER_DAY = 1.2;
/** Questions one async container copy serves at the same time. */
export const QUESTIONS_PER_COPY = 20;
/** The busy hour runs at this many times the daily average. */
export const BUSY_HOUR_FACTOR = 5;

export type CostOutcome = {
  serverlessPerDay: number;
  copies: number;
  containersPerDay: number;
  /** Questions a day at which the two cost the same, while one copy is enough. */
  breakEvenQuestions: number;
};

/**
 * Serverless bills every second each question runs: questions x seconds x
 * price per GB-second x memory. Container copies are billed per day whether
 * busy or idle. Copies = enough for the busy-hour peak (5 times the average
 * number of questions in progress), 20 at once per copy, at least 1; once the
 * peak needs 2 or more, 1 spare is added so a copy can fail. Break-even is
 * where serverless equals one copy: 1.20 / (seconds x 0.0001 x memory).
 */
export function dailyCost({ questionsPerDay, secondsPerQuestion, memoryGb }: CostInputs): CostOutcome {
  const serverlessPerDay = questionsPerDay * secondsPerQuestion * SERVERLESS_PER_GB_SECOND * memoryGb;
  const averageInProgress = (questionsPerDay * secondsPerQuestion) / 86400;
  const forPeak = Math.max(1, Math.ceil((averageInProgress * BUSY_HOUR_FACTOR) / QUESTIONS_PER_COPY));
  const copies = forPeak >= 2 ? forPeak + 1 : forPeak;
  return {
    serverlessPerDay,
    copies,
    containersPerDay: copies * COPY_PER_DAY,
    breakEvenQuestions: COPY_PER_DAY / (secondsPerQuestion * SERVERLESS_PER_GB_SECOND * memoryGb),
  };
}

function inputsFrom(values: SliderValues): CostInputs {
  return {
    questionsPerDay: values.questionsPerDay ?? 2000,
    secondsPerQuestion: values.secondsPerQuestion ?? 4,
    memoryGb: values.memoryGb ?? 1,
  };
}

export function formatDollars(amount: number): string {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Rounded so it does not claim more precision than the model has. */
export function formatQuestions(count: number): string {
  const rounded = count >= 1000 ? Math.round(count / 100) * 100 : Math.round(count / 10) * 10;
  return rounded.toLocaleString("en-US");
}

/** Which option is cheaper and by how much, in cents to avoid rounding noise. */
export function cheaper(o: CostOutcome): { winner: "serverless" | "containers" | "same"; by: number } {
  const s = Math.round(o.serverlessPerDay * 100);
  const c = Math.round(o.containersPerDay * 100);
  if (s === c) return { winner: "same", by: 0 };
  return s < c ? { winner: "serverless", by: (c - s) / 100 } : { winner: "containers", by: (s - c) / 100 };
}

export function computeCost(values: SliderValues): SliderResult {
  const inputs = inputsFrom(values);
  const o = dailyCost(inputs);
  const win = cheaper(o);
  const copies = `${o.copies} ${o.copies === 1 ? "copy" : "copies"}`;
  const winnerText = win.winner === "same" ? "Same cost" : win.winner === "serverless" ? "Serverless" : "Containers";
  return {
    stats: [
      { label: "Serverless a day", value: formatDollars(o.serverlessPerDay), detail: `${inputs.memoryGb} GB, billed per second` },
      { label: "Containers a day", value: formatDollars(o.containersPerDay), detail: `${copies}, always on` },
      {
        label: "Cheaper",
        value: winnerText,
        detail: `${win.winner === "same" ? "" : `by ${formatDollars(win.by)}; `}equal near ${formatQuestions(o.breakEvenQuestions)} a day`,
      },
    ],
    bars: [
      { label: "Serverless functions", value: o.serverlessPerDay, display: formatDollars(o.serverlessPerDay), tone: win.winner === "serverless" ? "good" : undefined },
      { label: `Container service, ${copies}`, value: o.containersPerDay, display: formatDollars(o.containersPerDay), tone: win.winner === "containers" ? "good" : undefined },
    ],
    summary:
      win.winner === "same"
        ? `At ${inputs.questionsPerDay.toLocaleString("en-US")} questions a day both options cost ${formatDollars(o.serverlessPerDay)} a day at the example prices.`
        : `At ${inputs.questionsPerDay.toLocaleString("en-US")} questions a day of ${inputs.secondsPerQuestion} s each, serverless costs ${formatDollars(o.serverlessPerDay)} and ${copies} ${o.copies === 1 ? "costs" : "cost"} ${formatDollars(o.containersPerDay)} a day at the example prices, so ${win.winner === "serverless" ? "serverless is" : "containers are"} cheaper by ${formatDollars(win.by)}.`,
  };
}

export function describeCostChange(before: SliderValues, after: SliderValues): string {
  const a = inputsFrom(before);
  const b = inputsFrom(after);
  const x = dailyCost(a);
  const y = dailyCost(b);
  const changed: string[] = [];
  if (a.questionsPerDay !== b.questionsPerDay) changed.push("traffic");
  if (a.secondsPerQuestion !== b.secondsPerQuestion) changed.push("the time per question");
  if (a.memoryGb !== b.memoryGb) changed.push("the function memory");
  if (changed.length === 0) return "Nothing changed.";
  const moved = changed.length === 1 ? `Changing ${changed[0]}` : "Changing several inputs";
  const wasWinner = cheaper(x).winner;
  const win = cheaper(y);
  const flip = wasWinner !== win.winner && win.winner !== "same"
    ? ` The cheaper option flipped to ${win.winner}, by ${formatDollars(win.by)} a day.`
    : win.winner === "same"
      ? " The two now cost the same."
      : ` ${win.winner === "serverless" ? "Serverless stays" : "Containers stay"} cheaper, by ${formatDollars(win.by)} a day.`;
  const copyNote = x.copies === y.copies ? `stayed at ${formatDollars(y.containersPerDay)}, because ${y.copies === 1 ? "one copy still covers" : `${y.copies} copies still cover`} the busy hour` : `went from ${formatDollars(x.containersPerDay)} to ${formatDollars(y.containersPerDay)} as copies went from ${x.copies} to ${y.copies}`;
  return `${moved} moved serverless from ${formatDollars(x.serverlessPerDay)} to ${formatDollars(y.serverlessPerDay)} a day, since it bills every second of waiting. Containers ${copyNote}.${flip}`;
}

export const serverlessVsClusterCost: SliderSpec = {
  kind: "slider",
  title: "Serverless or always-on copies",
  purpose: "Change traffic, how long each question runs and the function's memory, and see which option costs less per day at this example's prices.",
  intro:
    "Example prices, not any provider's: a 1 GB serverless function costs $0.0001 per second it runs, and a container copy costs $1.20 a day and serves 20 questions at once. Wadi Labs' bot gets 2,000 questions a day of about 4 seconds. Predict which is cheaper, then raise the traffic.",
  inputs: [
    { id: "questionsPerDay", label: "Questions a day", min: 1000, max: 150000, step: 1000, default: 2000, unit: "questions" },
    { id: "secondsPerQuestion", label: "Seconds per question", min: 1, max: 30, step: 1, default: 4, unit: "s" },
    { id: "memoryGb", label: "Function memory", min: 0.5, max: 4, step: 0.5, default: 1, unit: "GB" },
  ],
  compute: computeCost,
  describeChange: describeCostChange,
  barsTitle: "Cost per day at the example prices",
  tryThis: [
    "Raise questions to 100,000 a day. Serverless rises to $40.00 a day while the container service needs only 3 copies, $3.60, because each copy shares its waiting across 20 questions.",
    "Go back to 2,000 questions and raise the seconds per question from 4 to 8. Serverless doubles to $1.60 and becomes the dearer option, and the break-even falls from about 3,000 to about 1,500 questions a day.",
  ],
  limits:
    "All prices are this example's own, not any provider's. Copies are sized for a busy hour at 5 times the daily average, with one spare once two or more are needed. The model ignores free tiers, request fees, network costs, cold starts and the cost of the people who run each option, which for Kubernetes is often the largest.",
};
