// A discrete-event simulation on a virtual clock in milliseconds. Events run
// in time order; two events at the same time run in the order they were
// scheduled, so a model decides ties on purpose (for example "a replica
// applies a write before a read that arrives at the same moment").

type Scheduled = { at: number; order: number; run: () => void };

export type Simulation = {
  /** The virtual time of the event that is running, in ms. */
  readonly now: () => number;
  /** Run `run` at virtual time `at` (ms). Times in the past run next. */
  schedule: (at: number, run: () => void) => void;
  /** Run `run` `delay` ms after now. */
  after: (delay: number, run: () => void) => void;
  /** Run every event up to and including `until` ms. Returns the events run. */
  runUntil: (until: number) => number;
  /** Run until no events are left, with a hard cap so a bad model cannot hang the page. */
  runAll: (maxEvents?: number) => number;
};

export function createSimulation(): Simulation {
  let now = 0;
  let order = 0;
  const queue: Scheduled[] = [];

  const schedule = (at: number, run: () => void) => {
    const item = { at: Math.max(at, now), order: order++, run };
    // Insert in place: event counts in a canvas are small.
    let i = queue.length;
    while (i > 0 && (queue[i - 1].at > item.at || (queue[i - 1].at === item.at && queue[i - 1].order > item.order))) i--;
    queue.splice(i, 0, item);
  };

  const step = () => {
    const item = queue.shift();
    if (!item) return false;
    now = item.at;
    item.run();
    return true;
  };

  return {
    now: () => now,
    schedule,
    after: (delay, run) => schedule(now + Math.max(0, delay), run),
    runUntil: (until) => {
      let count = 0;
      while (queue.length > 0 && queue[0].at <= until && step()) count++;
      now = Math.max(now, until);
      return count;
    },
    runAll: (maxEvents = 10_000) => {
      let count = 0;
      while (count < maxEvents && step()) count++;
      return count;
    },
  };
}
