import type { CustomCanvasSpec } from "../registry";
import { BurnReplayCanvas } from "./BurnReplayCanvas";

// 17.4 beat 3, "Replay an incident, see who is paged". Model: ./model.ts.
export const sysdesignM17BurnReplay: CustomCanvasSpec = {
  kind: "custom",
  title: "Replay an incident, see who is paged",
  purpose: "Pick an incident, switch the naive, fast and slow alerts on or off, and drag through time. The naive alert pages for the blip too; the burn-rate alerts ignore it, page for the outage, and the slow one catches the leak the fast one misses.",
  limits:
    "A fluid model with no random noise: a steady 0.05% error baseline, then one incident at a fixed error rate, measured in whole minutes against a 99.9% SLO over 30 days. The incidents and the baseline are course numbers. Real error rates are noisy, so real page times differ a little (challenge 16 pages at minute 17 and 142 where this clean model says 17 and 173), and the naive alert's 27 false pages a day come from that noise, which this picture does not draw.",
  component: BurnReplayCanvas,
};
