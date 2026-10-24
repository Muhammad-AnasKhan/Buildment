import type { CustomCanvasSpec } from "../registry";
import { LaunchDayCanvas } from "./LaunchDayCanvas";

// Beat 1 of 1.1: Daftar (a fictional notes app) runs on one server. Each
// online student sends 0.05 requests a second, one request takes 10 ms, so
// the server can finish 100 a second. The learner drags the crowd from 10 to
// 100,000 students; the model is in models/server-load.ts.
export const sysdesignM1LaunchDay: CustomCanvasSpec = {
  kind: "custom",
  title: "Launch day: more students, one server",
  purpose: "Drag the crowd from 10 to 100,000 students and watch one server go from idle to busy to overloaded, while the time per request bends up near 100%.",
  limits:
    "Made-up numbers for a fictional app: each online student sends one request every 20 seconds, and the server needs 10 ms per request, so it can finish 100 a second. Times come from a simple queueing formula (M/M/1) that shows the shape, not exact values. One dot stands for many requests, and the crowd grows one figure per step, not one per student.",
  component: LaunchDayCanvas,
};
