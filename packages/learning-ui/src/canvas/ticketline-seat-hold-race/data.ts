import type { CustomCanvasSpec } from "../registry";
import { SeatHoldRaceCanvas } from "./SeatHoldRaceCanvas";

export const ticketlineSeatHoldRace: CustomCanvasSpec = {
  kind: "custom",
  title: "Seat hold race: one snapshot, many buyers",
  purpose: "Change buyer requests and remaining seats to see why a hold must be atomic.",
  limits: "This shows a worst-case batch in which every unguarded request reads the same available-seat snapshot. Real requests have timing and transactions; the exact oversell depends on their ordering. The atomic path represents a single guarded capacity update, not a full checkout system.",
  component: SeatHoldRaceCanvas,
};
