import type { CustomCanvasSpec } from "../registry";
import { AddZonesCanvas } from "./AddZonesCanvas";

// 19.2 beat 2, "Add zones and watch the gain stop". Model: ./model.ts.
export const sysdesignM19AddZones: CustomCanvasSpec = {
  kind: "custom",
  title: "Add zones and watch the gain stop",
  purpose: "Drag to choose 1 to 4 zones and tap a zone to fail it. Two zones survive a zone fault; the third and fourth add almost no uptime because the shared layer causes most of the downtime. The capacity bill, n / (n - 1) times the peak, is what carries the load after a zone is lost.",
  limits: "Made-up availability for each zone (99.9%) and for the shared layer (99.95%), and zone faults that never happen together. Real zones have correlated faults too, and cross-zone data transfer costs money.",
  component: AddZonesCanvas,
};
