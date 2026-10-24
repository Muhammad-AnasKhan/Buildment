export const BLOCK = 15;
export const GRID_START = 9 * 60;
export const GRID_END = 11 * 60 + 30;
export const DURATION = 60;
export const BUFFER = 15;
export const START_BOUNDS = { min: GRID_START, max: GRID_END - DURATION - BUFFER, default: GRID_START } as const;
export const EARLY_CLAIM = 9 * 60 + 45;
export const LATE_CLAIM = 10 * 60 + 30;

export type ClaimInput = { start: number; earlyClaim: boolean; lateClaim: boolean };
export type BlockRow = { minute: number; needed: boolean; existing: boolean; collision: boolean; purpose: "service" | "buffer" | "none" };
export type ClaimRun = { input: ClaimInput; occupiedEnd: number; rows: BlockRow[]; needed: number[]; collisions: number[]; canHold: boolean };
export const DEFAULT_INPUT: ClaimInput = { start: GRID_START, earlyClaim: true, lateClaim: false };

export function formatMinute(minute: number): string {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

export function simulateClaims(raw: ClaimInput): ClaimRun {
  const validStart = Number.isFinite(raw.start) ? Math.round(raw.start / BLOCK) * BLOCK : START_BOUNDS.default;
  const input: ClaimInput = {
    start: Math.min(START_BOUNDS.max, Math.max(START_BOUNDS.min, validStart)),
    earlyClaim: Boolean(raw.earlyClaim),
    lateClaim: Boolean(raw.lateClaim),
  };
  const occupiedEnd = input.start + DURATION + BUFFER;
  const existing = new Set<number>();
  if (input.earlyClaim) existing.add(EARLY_CLAIM);
  if (input.lateClaim) existing.add(LATE_CLAIM);
  const rows: BlockRow[] = [];
  for (let minute = GRID_START; minute < GRID_END; minute += BLOCK) {
    const needed = minute >= input.start && minute < occupiedEnd;
    const isExisting = existing.has(minute);
    rows.push({ minute, needed, existing: isExisting, collision: needed && isExisting,
      purpose: !needed ? "none" : minute < input.start + DURATION ? "service" : "buffer" });
  }
  const needed = rows.filter((row) => row.needed).map((row) => row.minute);
  const collisions = rows.filter((row) => row.collision).map((row) => row.minute);
  return { input, occupiedEnd, rows, needed, collisions, canHold: collisions.length === 0 };
}
