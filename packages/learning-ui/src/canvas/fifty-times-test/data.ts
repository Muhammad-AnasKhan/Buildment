import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// The Founder Interview course, chapter 5.6 "Check your work area by area".
// A technical founder asks Yazan what happens at fifty times today's traffic.
// The report system has four parts, each with a fixed capacity in requests a
// minute. The numbers are stated for this example only: it is a toy model, and
// a real answer comes from a load test. See spec.md.

export type FiftyInputs = {
  /** Report requests in the busiest minute today. */
  busy: number;
  /** How many times today's traffic to test. */
  times: number;
  /** 1 when slow work goes through a queue, 0 when each request builds the report itself. */
  queue: number;
};

export type Part = {
  id: string;
  name: string;
  /** Requests a minute the part can handle when slow work goes through a queue. */
  withQueue: number;
  /** The same, when each request builds the report itself. Null means the part is not used. */
  withoutQueue: number | null;
};

export const PARTS: Part[] = [
  { id: "web", name: "Web server", withQueue: 500, withoutQueue: 80 },
  { id: "database", name: "Database", withQueue: 300, withoutQueue: 100 },
  { id: "workers", name: "Report workers", withQueue: 160, withoutQueue: null },
  { id: "email", name: "Email limit", withQueue: 100, withoutQueue: null },
];

export type PartLoad = {
  id: string;
  name: string;
  used: boolean;
  /** Requests a minute the part can handle. Zero when the part is not used. */
  capacity: number;
  /** Load as a share of capacity, in percent. Zero when the part is not used. */
  percent: number;
  /** True when the load is at or above the limit. */
  atLimit: boolean;
  /** How many times today's traffic fills the part. Null when not used. */
  fullAtTimes: number | null;
};

function inputsFrom(values: SliderValues): FiftyInputs {
  return {
    busy: values.busy ?? 40,
    times: values.times ?? 1,
    queue: values.queue ?? 1,
  };
}

export function traffic({ busy, times }: FiftyInputs): number {
  return busy * times;
}

/** Load on each part: traffic divided by that part's capacity. */
export function partLoads(inputs: FiftyInputs): PartLoad[] {
  const requests = traffic(inputs);
  return PARTS.map((part) => {
    const capacity = inputs.queue >= 1 ? part.withQueue : part.withoutQueue;
    if (capacity === null) {
      return { id: part.id, name: part.name, used: false, capacity: 0, percent: 0, atLimit: false, fullAtTimes: null };
    }
    const percent = (requests / capacity) * 100;
    return {
      id: part.id,
      name: part.name,
      used: true,
      capacity,
      percent,
      atLimit: percent >= 100,
      fullAtTimes: capacity / inputs.busy,
    };
  });
}

/** The used part with the lowest capacity: the first to reach its limit as traffic grows. */
export function firstWall(inputs: FiftyInputs): PartLoad {
  const used = partLoads(inputs).filter((p) => p.used);
  return used.reduce((first, p) => (p.capacity < first.capacity ? p : first));
}

export function formatCount(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function formatTimes(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

export function computeFifty(values: SliderValues): SliderResult {
  const inputs = inputsFrom(values);
  const loads = partLoads(inputs);
  const wall = firstWall(inputs);
  const used = loads.filter((p) => p.used);
  const over = used.filter((p) => p.atLimit).length;
  const requests = traffic(inputs);

  const summary =
    over === 0
      ? `At ${formatCount(requests)} requests a minute no part is at its limit. The first wall is ${wall.name}, which is full at ${formatTimes(wall.fullAtTimes!)} times today's traffic.`
      : `At ${formatCount(requests)} requests a minute, ${over} of ${used.length} parts are at their limit. The first wall is ${wall.name}, which is full at ${formatTimes(wall.fullAtTimes!)} times today's traffic.`;

  return {
    stats: [
      { label: "Requests a minute", value: formatCount(requests), detail: `today's busiest minute x ${inputs.times}` },
      { label: "First wall", value: wall.name, detail: `full at ${formatTimes(wall.fullAtTimes!)} times today` },
      { label: "Parts at their limit", value: `${over} of ${used.length}`, detail: inputs.queue >= 1 ? "with a queue" : "no queue" },
    ],
    bars: loads.map((p) => ({
      label: p.name,
      value: p.percent,
      display: p.used ? `${formatCount(p.percent)}%` : "not used",
      tone: !p.used ? undefined : p.atLimit ? ("bad" as const) : p.percent >= 70 ? ("warn" as const) : undefined,
    })),
    barMax: 100,
    summary,
  };
}

export function describeFiftyChange(before: SliderValues, after: SliderValues): string {
  const a = inputsFrom(before);
  const b = inputsFrom(after);
  if (a.busy === b.busy && a.times === b.times && a.queue === b.queue) return "Nothing changed.";

  const wallBefore = firstWall(a);
  const wallAfter = firstWall(b);
  const overBefore = partLoads(a).filter((p) => p.used && p.atLimit).length;
  const overAfter = partLoads(b).filter((p) => p.used && p.atLimit).length;
  const usedAfter = partLoads(b).filter((p) => p.used).length;

  if (a.queue !== b.queue) {
    const how =
      b.queue >= 1
        ? "Slow work now goes through a queue, so the web server and the database only start jobs and the report workers and the email service do the rest."
        : "Each request now builds its own report, so the web server and the database do the slow work and the workers and the email service are not used.";
    return `${how} The first wall is ${wallAfter.name}, full at ${formatTimes(wallAfter.fullAtTimes!)} times today's traffic (before: ${wallBefore.name} at ${formatTimes(wallBefore.fullAtTimes!)}).`;
  }

  const requestsBefore = traffic(a);
  const requestsAfter = traffic(b);
  const moved = a.times !== b.times ? "the multiplier" : "today's busiest minute";
  const wallText =
    wallAfter.id === wallBefore.id && a.busy === b.busy
      ? `The first wall stays ${wallAfter.name}: it does not depend on the multiplier, only on its own limit.`
      : `The first wall is now ${wallAfter.name}, full at ${formatTimes(wallAfter.fullAtTimes!)} times today's traffic.`;
  return `Changing ${moved} moved traffic from ${formatCount(requestsBefore)} to ${formatCount(requestsAfter)} requests a minute. Parts at their limit went from ${overBefore} to ${overAfter} of ${usedAfter}. ${wallText}`;
}

export const fiftyTimesTest: SliderSpec = {
  kind: "slider",
  title: "What breaks first at fifty times the traffic?",
  purpose: "Change how much traffic arrives and whether slow work goes through a queue, and see which part of the report system reaches its limit first.",
  intro:
    "Yazan's report system has four parts, each with a limit fixed for this example. Today's busiest minute is 40 report requests. A technical founder asks: what happens at fifty times today's traffic? Predict which part reaches its limit first, then raise the multiplier.",
  inputs: [
    { id: "busy", label: "Busiest minute today", min: 10, max: 100, step: 10, default: 40, unit: "requests/min" },
    { id: "times", label: "Times today's traffic", min: 1, max: 50, step: 1, default: 1, unit: "x" },
    { id: "queue", label: "Queue for slow work (1=yes)", min: 0, max: 1, step: 1, default: 1, unit: "0 or 1" },
  ],
  compute: computeFifty,
  describeChange: describeFiftyChange,
  barsTitle: "Load as a share of each part's limit",
  tryThis: [
    "Set the multiplier to 2, then to 3. The email limit passes 100% between them, long before the web server or the database does.",
    "Set the multiplier to 50. Every part that is used is far over its limit. A good answer to 'fifty times' names the first wall, not all of them.",
    "Set the multiplier back to 1 and turn the queue off. The slow work now happens inside each request, and the web server is the first wall, at 2 times today's traffic.",
  ],
  limits:
    "This is a toy model with limits fixed for this example: 500, 300, 160 and 100 requests a minute with a queue, and 80 and 100 without. Real parts have no single number, and real traffic does not grow evenly. A real answer to 'what happens at fifty times?' comes from a load test, or from an honest 'I did not test that' and the first thing you would check.",
};
