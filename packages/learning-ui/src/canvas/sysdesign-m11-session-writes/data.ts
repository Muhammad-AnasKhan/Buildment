import type { CustomCanvasSpec } from "../registry";
import { SessionWritesCanvas } from "./SessionWritesCanvas";

// 11.5 beat 3 "Writes can break too". Model: models/session-writes.ts.
export const sysdesignM11SessionWrites: CustomCanvasSpec = {
  kind: "custom",
  title: "Writes need order too",
  purpose: "Switch on write numbers to keep Amna's two edits in order, and dependencies to keep Omar's reply from showing before its question.",
  limits: "Course numbers for delays. In a single-leader store where the client waits for each reply, write numbers are not needed.",
  component: SessionWritesCanvas,
};
