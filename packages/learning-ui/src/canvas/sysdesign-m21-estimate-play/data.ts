import type { CustomCanvasSpec } from "../registry";
import { EstimatePlayCanvas } from "./EstimatePlayCanvas";

// 21.1 beat 2: Hikaya's estimate drawn as three chains from one card.
// Model: models/feed-estimate.ts. Course numbers: models/feed-numbers.ts.
export const sysdesignM21EstimatePlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the volume, find the driver",
  purpose: "Change the daily users, the feed opens each user makes and the follows per account, and watch three chains update, from feed opens and lookups a second to posts a second and timeline storage, with a ring on the number that drives the design.",
  limits:
    "Hikaya is made up and every input is a course assumption. A day is 86,400 seconds, the busiest second is fixed at 3 times the average, a daily user posts 0.2 times a day, and a timeline holds 800 post ids of 8 bytes. The picture leaves out copies for safety, the follow data itself, the posts' own storage, growth, and how unevenly people open the app. The 100,000 lookups a second and 25 reads for each post that decide the ring and the verdict are rules of thumb for this picture, not limits of any real machine.",
  component: EstimatePlayCanvas,
};
