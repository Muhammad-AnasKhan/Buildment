import type { CustomCanvasSpec } from "../registry";
import { StaleRaceCanvas } from "./StaleRaceCanvas";

// 5.5 "Move the slow reader, find the race". Model: models/stale-race.ts.
export const sysdesignM5StaleRace: CustomCanvasSpec = {
  kind: "custom",
  title: "Move the slow reader, find the race",
  purpose: "Drag the moment the slow reader stores its old price, and see whether the delete wins or the old price stays until the TTL. Then switch leases on.",
  limits:
    "The timings (10, 20 and 25 ms) are course examples chosen to show the order of events. The race needs a reader that is slow between its database read and its cache set, for example during a garbage collection pause or a slow network. It is rare for one read and common at high traffic. Leases are shown the way Facebook's memcache describes them: a delete cancels the reader's lease, so the cache refuses its set.",
  component: StaleRaceCanvas,
};
