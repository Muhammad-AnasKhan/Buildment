// Why Things Happen course, chapter 6.3 "Loops that pull back, delays and stocks".
// Huda's pile of waiting orders as a stock: new orders flow in, baked cakes
// flow out, one working day at a time. Pure functions only; see spec.md.

export const ORDERS_BOUNDS = { min: 3, max: 10, default: 7 } as const;
export const BAKED_BOUNDS = { min: 4, max: 10, default: 6 } as const;
export const START_BOUNDS = { min: 0, max: 24, default: 12 } as const;

/** Four working weeks of six days, as in the chapter. */
export const DAYS = 24;
/** Customers hear about the wait about a working week after it happens. */
export const REACTION_DELAY = 6;

export type PileInput = {
  /** New orders per day before any customer reacts to the wait. */
  ordersPerDay: number;
  /** Cakes the oven bakes per day: the most the pile can drain in a day. */
  bakedPerDay: number;
  /** Orders already waiting at the start of day 1. */
  startPile: number;
  /** When on, each day of waiting that customers heard about a week ago turns away one order a day. */
  customersReact: boolean;
};

export type DayRow = {
  day: number;
  orders: number;
  baked: number;
  /** Orders still waiting at the end of the day. */
  pile: number;
  /** Extra days a new order waits before it reaches the oven: pile divided by cakes baked per day. */
  waitDays: number;
};

export type PileRun = {
  input: PileInput;
  rows: DayRow[];
  endPile: number;
  peakPile: number;
  peakDay: number;
  endWaitDays: number;
  /** Change in the pile on day 1, in orders. */
  firstDayChange: number;
};

export const DEFAULT_INPUT: PileInput = {
  ordersPerDay: ORDERS_BOUNDS.default,
  bakedPerDay: BAKED_BOUNDS.default,
  startPile: START_BOUNDS.default,
  customersReact: false,
};

function clamp(value: number, bounds: { min: number; max: number; default: number }): number {
  if (!Number.isFinite(value)) return bounds.default;
  return Math.max(bounds.min, Math.min(bounds.max, Math.round(value)));
}

export function clampInput(input: PileInput): PileInput {
  return {
    ordersPerDay: clamp(input.ordersPerDay, ORDERS_BOUNDS),
    bakedPerDay: clamp(input.bakedPerDay, BAKED_BOUNDS),
    startPile: clamp(input.startPile, START_BOUNDS),
    customersReact: Boolean(input.customersReact),
  };
}

/** Extra days of waiting for a pile, rounded to one decimal. */
export function waitDays(pile: number, bakedPerDay: number): number {
  return Math.round((pile / bakedPerDay) * 10) / 10;
}

/** Run the pile for DAYS working days. Same input, same run. */
export function simulatePile(raw: PileInput): PileRun {
  const input = clampInput(raw);
  const rows: DayRow[] = [];
  let pile = input.startPile;

  for (let day = 1; day <= DAYS; day += 1) {
    let orders = input.ordersPerDay;
    if (input.customersReact) {
      const seenDay = day - REACTION_DELAY;
      const seenPile = seenDay >= 1 ? rows[seenDay - 1].pile : input.startPile;
      const seenWait = seenPile / input.bakedPerDay;
      orders = Math.max(0, input.ordersPerDay - Math.round(seenWait));
    }
    const available = pile + orders;
    const baked = Math.min(input.bakedPerDay, available);
    pile = available - baked;
    rows.push({ day, orders, baked, pile, waitDays: waitDays(pile, input.bakedPerDay) });
  }

  let peakPile = input.startPile;
  let peakDay = 0;
  for (const row of rows) {
    if (row.pile > peakPile) {
      peakPile = row.pile;
      peakDay = row.day;
    }
  }
  const endPile = rows[rows.length - 1].pile;
  return {
    input,
    rows,
    endPile,
    peakPile,
    peakDay,
    endWaitDays: waitDays(endPile, input.bakedPerDay),
    firstDayChange: rows[0].pile - input.startPile,
  };
}

/** Plain words for the trend: is the pile rising, falling or level? */
export function describeTrend(run: PileRun): string {
  const { ordersPerDay, bakedPerDay, startPile, customersReact } = run.input;
  if (customersReact) {
    if (run.peakPile > startPile && run.endPile < run.peakPile) {
      return `The pile rose to ${run.peakPile} on day ${run.peakDay}, then fell to ${run.endPile}, because customers react to waits they heard about a week earlier.`;
    }
    return `With customers reacting a week late, the pile ends at ${run.endPile} orders.`;
  }
  const gap = ordersPerDay - bakedPerDay;
  if (gap > 0) {
    return `${ordersPerDay} orders come in and ${bakedPerDay} cakes go out each day, so the pile grows by ${gap} a day, from ${startPile} to ${run.endPile}.`;
  }
  if (gap === 0) {
    return `As many orders come in as cakes go out, ${ordersPerDay} a day, so the pile stays at ${run.endPile}.`;
  }
  if (run.endPile === 0) {
    const emptyDay = run.rows.find((row) => row.pile === 0)?.day ?? DAYS;
    return `${bakedPerDay} cakes go out and only ${ordersPerDay} orders come in each day, so the pile shrinks and is empty by day ${emptyDay}.`;
  }
  return `${bakedPerDay} cakes go out and only ${ordersPerDay} orders come in each day, so the pile shrinks by ${-gap} a day, to ${run.endPile}.`;
}

/** The live "What changed" sentence: the delta in words, not only new numbers. */
export function describeChange(before: PileRun | null, after: PileRun): string {
  if (before === null) return describeTrend(after);
  const a = before.input;
  const b = after.input;
  const parts: string[] = [];
  if (a.ordersPerDay !== b.ordersPerDay) parts.push(`Orders went from ${a.ordersPerDay} to ${b.ordersPerDay} a day.`);
  if (a.bakedPerDay !== b.bakedPerDay) parts.push(`Baking went from ${a.bakedPerDay} to ${b.bakedPerDay} cakes a day.`);
  if (a.startPile !== b.startPile) parts.push(`The starting pile went from ${a.startPile} to ${b.startPile} orders.`);
  if (a.customersReact !== b.customersReact) {
    parts.push(b.customersReact ? "Customers now react to the wait, a week late." : "Customers no longer react to the wait.");
  }
  const endMove =
    before.endPile === after.endPile
      ? `The pile on day ${DAYS} is still ${after.endPile}.`
      : `The pile on day ${DAYS} is now ${after.endPile}, not ${before.endPile}.`;
  return [...parts, describeTrend(after), endMove].join(" ");
}
