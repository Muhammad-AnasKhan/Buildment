// 19.2 beat 4: the share of customers hit by one bad request is 1 / (number
// of cells). 100 customers numbered 1 to 100 are dealt to the cells in turn,
// so cells are interleaved and a router, not geography, decides.

export const CUSTOMERS = 100;
export const POISON_CUSTOMER = 37;
export const CELL_COUNTS = [1, 2, 4, 10] as const;
export const DEFAULT_CELLS = 4;

/** The cell (1 to n) that customer c (1 to 100) belongs to. */
export function cellOf(customer: number, cells: number): number {
  return ((customer - 1) % cells) + 1;
}

/** Customers (1 to 100) in the same cell as the poison customer. */
export function affectedCustomers(cells: number, poison = POISON_CUSTOMER): number[] {
  const cell = cellOf(poison, cells);
  const out: number[] = [];
  for (let c = 1; c <= CUSTOMERS; c++) if (cellOf(c, cells) === cell) out.push(c);
  return out;
}

export const affectedCount = (cells: number) => affectedCustomers(cells).length;

/** Row and column (0 to 9) of customer c in the 10 by 10 grid. */
export function gridSpot(customer: number): { row: number; col: number } {
  return { row: Math.floor((customer - 1) / 10), col: (customer - 1) % 10 };
}

export type Verdict = { text: string; tone: "good" | "warn" | "bad" | "accent" };

export function verdictFor(cells: number, sent: boolean): Verdict {
  if (!sent) return { text: "Tap the poison customer", tone: "accent" };
  const pct = affectedCount(cells);
  return { text: `${pct}% of customers affected`, tone: pct >= 50 ? "bad" : pct >= 25 ? "warn" : "good" };
}

/** How many of the affected dots have turned red after `elapsed` seconds. */
export function turnedCount(affected: number, elapsed: number, perSecond = 45): number {
  return Math.max(0, Math.min(affected, Math.floor(elapsed * perSecond)));
}
