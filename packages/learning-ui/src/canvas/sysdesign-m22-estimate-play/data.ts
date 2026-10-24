import type { CustomCanvasSpec } from "../registry";
import { EstimatePlayCanvas } from "./EstimatePlayCanvas";

// 22.1 beat 2: Dardasha's estimate drawn as three chains from one card.
// Model: models/dardasha-estimate.ts. Course numbers: models/dardasha-numbers.ts.
export const sysdesignM22EstimatePlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the users, find the load",
  purpose: "Change the daily users, the messages each person sends or the share of phones online and watch three chains update, from messages a second to open lines and gateways to storage, with a ring on the number that drives the design.",
  limits:
    "Dardasha is made up and every input is a course assumption. A day is 86,400 seconds, the busiest second is fixed at 3 times the average, a message has 3 recipients, a user has 1.5 devices, a message takes 300 bytes and a gateway holds 50,000 lines. The picture leaves out copies for safety, indexes, growth during the year, groups much larger than average and the cost of the registry. The marks that decide the ring (20 gateways, 5,000 messages a second, 10 TB a year) are rules of thumb for this picture, not limits of any real machine.",
  component: EstimatePlayCanvas,
};
