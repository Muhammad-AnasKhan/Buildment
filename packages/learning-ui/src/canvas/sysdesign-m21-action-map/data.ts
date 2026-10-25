import type { CustomCanvasSpec } from "../registry";
import { ActionMapCanvas } from "./ActionMapCanvas";

// 21.2 beat 5: tap an action, see which blocks it touches and how often.
// Model: models/feed-actions.ts. Course numbers: models/feed-numbers.ts.
export const sysdesignM21ActionMap: CustomCanvasSpec = {
  kind: "custom",
  title: "Tap an action, see what it touches",
  purpose: "Tap Open feed, Open profile, Publish a post or Follow, and watch the blocks it uses light up with their rates at the busiest moment, so the cheap-but-constant reads and the heavy-but-rare writes can be told apart.",
  limits:
    "Hikaya is made up. Rates are the busiest second for 50 million daily users: 10 feed opens, 5 profile views, 0.2 posts and 0.1 new follows per user a day, times 3 for the peak. A feed open reads one timeline and one batch of 20 posts. The 52,000 timeline writes for a post assume every author has 150 followers, which real follower counts do not (chapter 21.3). The map leaves out the ranker, the page cache, the star-account lists, retries and the work inside each block.",
  component: ActionMapCanvas,
};
