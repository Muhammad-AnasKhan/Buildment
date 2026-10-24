import type { CustomCanvasSpec } from "../registry";
import { LaunchDayIllustratedCanvas } from "./LaunchDayIllustratedCanvas";

// Beat 1 of 1.1 (Illustrated edition): Daftar (a fictional notes app) runs on
// one rented server holding the app, the database and the PDFs. Each online
// student sends 0.05 requests a second, and one request takes 10 ms of work,
// so the server finishes at most 100 requests a second.
export const sysdesignM1LaunchDayIllustrated: CustomCanvasSpec = {
  kind: "custom",
  title: "Launch day: more students, one server",
  purpose:
    "Drag the crowd from 10 to 100,000 students and watch one server rack warm up, form a waiting line of requests that bends the response time curve upward near 100%, and puff smoke as timed-out requests spill past capacity.",
  limits:
    "Made-up numbers for a fictional app: each online student sends one request every 20 seconds (0.05 a second), and the server needs 10 ms per request, so it can finish at most 100 a second. Response times and waiting line lengths come from the M/M/1 queue formula, which teaches the knee shape rather than exact production measurements. Each paper plane or envelope in flight stands for many requests, the waiting chute caps at 18 visible envelopes, and the crowd grows logarithmically.",
  component: LaunchDayIllustratedCanvas,
};
