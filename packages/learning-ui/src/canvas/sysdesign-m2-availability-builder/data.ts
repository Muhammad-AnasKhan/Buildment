import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AvailabilityBuilderCanvas, type BuilderPart } from "./AvailabilityBuilderCanvas";

// 2.6 "Availability maths": the chapter's example targets. Load balancer
// 99.99%, app 99.9%, database 99.9%; the cache (99.95%, off at the start) is
// an extra part to try. Example targets, not measured values. Plain data
// only: this file has no "use client".
export const AVAILABILITY_PARTS: readonly BuilderPart[] = [
  { id: "lb", name: "Balancer", full: "Load balancer", kind: "router", availability: 0.9999, copies: 1 },
  { id: "app", name: "App", full: "App", kind: "server", availability: 0.999, copies: 1 },
  { id: "cache", name: "Cache", full: "Cache", kind: "cache", availability: 0.9995, copies: 0 },
  { id: "db", name: "Database", full: "Database", kind: "database", availability: 0.999, copies: 1 },
];

const TITLE = "Build a chain, add copies, count the nines";
const PURPOSE = "Add or remove parts in series and copies in parallel; the availability, the hours down a year and the red days follow.";
const LIMITS =
  "The availabilities are example targets, not measured values. The copy rule, 1 - (1 - a)^n, assumes copies fail independently; copies on one host, one rack or one zone, or hit by the same bad deploy, often fail together, and then a copy adds much less. Failover is drawn as instant and free, and the red days are spread over the year for the picture, not where real outages fall.";

function AvailabilityBuilderBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AvailabilityBuilderCanvas, { ...props, parts: AVAILABILITY_PARTS, maxCopies: 3 });
}

export const sysdesignM2AvailabilityBuilder: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: AvailabilityBuilderBeat,
};
