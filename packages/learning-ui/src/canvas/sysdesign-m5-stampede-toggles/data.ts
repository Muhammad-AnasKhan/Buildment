import type { CustomCanvasSpec } from "../registry";
import { StampedeTogglesCanvas } from "./StampedeTogglesCanvas";

// 5.6 "Toggle the fixes, watch the database". Model: models/stampede.ts.
export const sysdesignM5StampedeToggles: CustomCanvasSpec = {
  kind: "custom",
  title: "Toggle the fixes, watch the database",
  purpose: "Switch coalescing, a shared lease and serve-stale on and off for one hot key, then switch to 1,000 keys stored together and try random TTLs. Watch the database queue, the shoppers' wait and the load over three minutes.",
  limits:
    "Matjar's numbers are story numbers: 5,000 reads a second, a 50 ms rebuild, 20 app servers and a database that manages about 800 page queries a second. Misses during a rebuild come from Little's law (reads a second times rebuild time). A slow database makes the rebuild longer and the real count higher. In the 1,000-key view each key needs at least one rebuild, so the three fixes are switched off there; the 12-second spread from random TTLs is reasoning, not a measured result, and later cycles would spread wider. The chart uses a square-root scale so 20 a second still shows beside 5,000. One dot in the queue is one query, up to 24.",
  component: StampedeTogglesCanvas,
};
