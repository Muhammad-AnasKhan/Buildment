import type { CustomCanvasSpec } from "../registry";
import { DegradeMenuCanvas } from "./DegradeMenuCanvas";

// 16.6 beat 2, "Break a service, choose a fallback". Model: ./model.ts.
export const sysdesignM16DegradeMenu: CustomCanvasSpec = {
  kind: "custom",
  title: "Break a service, choose a fallback",
  purpose: "A phone screen shows six features, each on its own service. Tap a service to break it and tap a feature to choose what it does when its service is down. With no fallback, one broken extra fails the whole page. With the right fallbacks the customer can still order when any one service except Cart is down.",
  limits:
    "The tiers and the fallbacks are a course design, not a standard. Each feature depends on one service, and services fail independently, which real systems do not always do. Cached and default values have costs the picture only names (a closed shop in a cached list, a wrong delivery range), and money values should never come from a cache. The model says whether the customer can order; it does not say how many orders are lost.",
  component: DegradeMenuCanvas,
};
