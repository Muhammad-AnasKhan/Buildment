// A dated, fixed 13:00 Sufra window. Times are minutes after local midnight in
// this learning model. Production must resolve a kitchen IANA zone on the server.

export const WINDOW_START = 13 * 60;
export const BUFFER_MINUTES = 20;
export const TIMELINE_START = 10 * 60 + 30;
export const TIMELINE_END = WINDOW_START;

export const BOUNDS = {
  capacity: { min: 2, max: 12, default: 5 },
  generalLead: { min: 30, max: 90, default: 60 },
  slowPrep: { min: 45, max: 120, default: 90 },
  fastPrep: { min: 15, max: 75, default: 30 },
  slowLoad: { min: 1, max: 6, default: 3 },
  fastLoad: { min: 1, max: 6, default: 2 },
  arrival: { min: TIMELINE_START, max: 12 * 60 + 15, default: 11 * 60 + 31 },
} as const;

export type Dish = "slow" | "fast";
export type Arrival = { id: string; dish: Dish; minute: number };
export type WindowInput = {
  capacity: number;
  generalLead: number;
  slowPrep: number;
  fastPrep: number;
  slowLoad: number;
  fastLoad: number;
  arrivals: Arrival[];
};
export type Decision = "accepted" | "cutoff" | "capacity";
export type ArrivalResult = Arrival & {
  decision: Decision;
  cutoff: number;
  load: number;
  remainingBefore: number;
  remainingAfter: number;
};
export type WindowRun = {
  input: WindowInput;
  generalCutoff: number;
  slowCutoff: number;
  fastCutoff: number;
  results: ArrivalResult[];
  accepted: number;
  rejectedCutoff: number;
  rejectedCapacity: number;
  used: number;
  remaining: number;
};

export const DEFAULT_INPUT: WindowInput = {
  capacity: BOUNDS.capacity.default,
  generalLead: BOUNDS.generalLead.default,
  slowPrep: BOUNDS.slowPrep.default,
  fastPrep: BOUNDS.fastPrep.default,
  slowLoad: BOUNDS.slowLoad.default,
  fastLoad: BOUNDS.fastLoad.default,
  arrivals: [
    { id: "slow-early", dish: "slow", minute: 11 * 60 + 5 },
    { id: "slow-late", dish: "slow", minute: 11 * 60 + 31 },
    { id: "fast-middle", dish: "fast", minute: 11 * 60 + 31 },
    { id: "fast-late", dish: "fast", minute: 11 * 60 + 45 },
  ],
};

function bounded(value: number, bounds: { min: number; max: number; default: number }): number {
  if (!Number.isFinite(value)) return bounds.default;
  return Math.max(bounds.min, Math.min(bounds.max, Math.round(value)));
}

export function clampInput(input: WindowInput): WindowInput {
  return {
    capacity: bounded(input.capacity, BOUNDS.capacity),
    generalLead: bounded(input.generalLead, BOUNDS.generalLead),
    slowPrep: bounded(input.slowPrep, BOUNDS.slowPrep),
    fastPrep: bounded(input.fastPrep, BOUNDS.fastPrep),
    slowLoad: bounded(input.slowLoad, BOUNDS.slowLoad),
    fastLoad: bounded(input.fastLoad, BOUNDS.fastLoad),
    arrivals: input.arrivals.slice(0, 8).map((arrival, index) => ({
      id: String(arrival.id || `arrival-${index}`),
      dish: arrival.dish === "slow" ? "slow" : "fast",
      minute: bounded(arrival.minute, BOUNDS.arrival),
    })),
  };
}

/** The instant at the cutoff is closed. Only an earlier arrival may enter. */
export function dishCutoff(windowStart: number, generalLead: number, prepMinutes: number): number {
  return Math.min(windowStart - generalLead, windowStart - prepMinutes - BUFFER_MINUTES);
}

export function formatMinute(minute: number): string {
  const hours = Math.floor(minute / 60);
  const minutes = minute % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function simulateWindow(raw: WindowInput): WindowRun {
  const input = clampInput(raw);
  const generalCutoff = WINDOW_START - input.generalLead;
  const slowCutoff = dishCutoff(WINDOW_START, input.generalLead, input.slowPrep);
  const fastCutoff = dishCutoff(WINDOW_START, input.generalLead, input.fastPrep);
  let remaining = input.capacity;
  const ordered = input.arrivals.map((arrival, index) => ({ ...arrival, index })).sort((a, b) => a.minute - b.minute || a.index - b.index);
  const results: ArrivalResult[] = ordered.map((arrival) => {
    const cutoff = arrival.dish === "slow" ? slowCutoff : fastCutoff;
    const load = arrival.dish === "slow" ? input.slowLoad : input.fastLoad;
    const remainingBefore = remaining;
    const decision: Decision = arrival.minute >= cutoff ? "cutoff" : load > remaining ? "capacity" : "accepted";
    if (decision === "accepted") remaining -= load;
    return { id: arrival.id, dish: arrival.dish, minute: arrival.minute, decision, cutoff, load, remainingBefore, remainingAfter: remaining };
  });
  return {
    input,
    generalCutoff,
    slowCutoff,
    fastCutoff,
    results,
    accepted: results.filter((row) => row.decision === "accepted").length,
    rejectedCutoff: results.filter((row) => row.decision === "cutoff").length,
    rejectedCapacity: results.filter((row) => row.decision === "capacity").length,
    used: input.capacity - remaining,
    remaining,
  };
}

export function explainResult(result: ArrivalResult): string {
  const dish = result.dish === "slow" ? "Maqluba" : "Falafel";
  if (result.decision === "cutoff") {
    return `${dish} at ${formatMinute(result.minute)} is after its ${formatMinute(result.cutoff)} cutoff, even with ${result.remainingBefore} units left.`;
  }
  if (result.decision === "capacity") {
    return `${dish} at ${formatMinute(result.minute)} needs ${result.load} units, but only ${result.remainingBefore} remain.`;
  }
  return `${dish} at ${formatMinute(result.minute)} uses ${result.load} units; ${result.remainingAfter} remain.`;
}
