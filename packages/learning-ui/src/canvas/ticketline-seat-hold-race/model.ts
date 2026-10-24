/** A worst-case simultaneous batch: every unguarded request reads one snapshot. */
export type HoldRaceInputs = { buyers: number; seats: number };
export type HoldRaceOutcome = {
  buyers: number;
  seats: number;
  naive: { accepted: number; rejected: number; oversold: number };
  atomic: { accepted: number; rejected: number; oversold: 0 };
};

export const HOLD_RACE_BOUNDS = {
  buyers: { min: 0, max: 16, step: 1, default: 6 },
  seats: { min: 0, max: 12, step: 1, default: 4 },
} as const;

function bounded(value: number, min: number, max: number): number {
  return Number.isFinite(value) ? Math.max(min, Math.min(max, Math.round(value))) : min;
}

export function simulateHoldRace(inputs: HoldRaceInputs): HoldRaceOutcome {
  const buyers = bounded(inputs.buyers, HOLD_RACE_BOUNDS.buyers.min, HOLD_RACE_BOUNDS.buyers.max);
  const seats = bounded(inputs.seats, HOLD_RACE_BOUNDS.seats.min, HOLD_RACE_BOUNDS.seats.max);
  const naiveAccepted = seats > 0 ? buyers : 0;
  const atomicAccepted = Math.min(buyers, seats);
  return {
    buyers,
    seats,
    naive: { accepted: naiveAccepted, rejected: buyers - naiveAccepted, oversold: Math.max(0, naiveAccepted - seats) },
    atomic: { accepted: atomicAccepted, rejected: buyers - atomicAccepted, oversold: 0 },
  };
}

export function describeHoldRaceChange(before: HoldRaceInputs, after: HoldRaceInputs): string {
  const previous = simulateHoldRace(before);
  const next = simulateHoldRace(after);
  if (previous.buyers === next.buyers && previous.seats === next.seats) return "";
  const changed = previous.buyers !== next.buyers && previous.seats !== next.seats
    ? `You changed buyer requests to ${next.buyers} and seats to ${next.seats}.`
    : previous.buyers !== next.buyers
      ? `You changed buyer requests from ${previous.buyers} to ${next.buyers}.`
      : `You changed available seats from ${previous.seats} to ${next.seats}.`;
  return `${changed} In this simultaneous batch, an unguarded check goes from ${previous.naive.oversold} to ${next.naive.oversold} overbooked seats. An atomic hold accepts ${next.atomic.accepted} and refuses ${next.atomic.rejected}, so it never overbooks.`;
}
