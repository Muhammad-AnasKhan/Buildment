import type { CustomCanvasSpec } from "../registry";
import { SyncRateCanvas } from "./SyncRateCanvas";

// 11.6 beat 2 "The sync interval sets the clock". Model: models/sync-rate.ts
// (seeded mulberry32 from sim/random.ts for the fixed run).
export const sysdesignM11SyncRate: CustomCanvasSpec = {
  kind: "custom",
  title: "The sync interval sets the clock",
  purpose: "Drag the sync interval and the number of copies, and watch one write spread by rounds of random swaps. The time to agree is the rounds times the interval.",
  limits:
    "Made-up model: every copy up, one write, one random partner per round. Real systems have failures, uneven links and new writes. The average hides runs that take longer. The ring shows one fixed run for each size; the number in the banner is the average, not that run.",
  component: SyncRateCanvas,
};
