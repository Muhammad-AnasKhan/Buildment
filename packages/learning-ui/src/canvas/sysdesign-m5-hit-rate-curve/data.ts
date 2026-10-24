import type { CustomCanvasSpec } from "../registry";
import { HitRateCurveCanvas } from "./HitRateCurveCanvas";

// 5.4 "Drag the size, watch the hits". Model: models/hit-rate.ts.
export const sysdesignM5HitRateCurve: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the cache size, watch the hit rate",
  purpose: "Drag the cache size from 0.1% of the catalogue to all of it, and the skew from even traffic to strongly skewed, and watch how many reads the cache answers.",
  limits:
    "The curve assumes the cache holds exactly the most popular products, and that product popularity follows a Zipf-like law with the skew you pick. That is an assumption for the picture, not a measurement of a real shop. A real LRU or LFU cache only approximates the top products, so its hit rate sits a little below the curve, and lower still right after a restart. Popularity moves during a sale; the curve is one snapshot.",
  component: HitRateCurveCanvas,
};
