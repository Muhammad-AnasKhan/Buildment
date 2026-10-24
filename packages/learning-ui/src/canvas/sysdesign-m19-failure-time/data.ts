import type { CustomCanvasSpec } from "../registry";
import { FailureTimeCanvas } from "./FailureTimeCanvas";

// 19.3 beat 1, "Pick the moment it fails". Model: ./model.ts.
export const sysdesignM19FailureTime: CustomCanvasSpec = {
  kind: "custom",
  title: "Pick the moment it fails",
  purpose: "Drag the failure marker along the day and switch what protects the database. A nightly backup loses everything since 02:00; a log saved every 5 minutes loses at most 5 minutes but can take longer to replay; a live copy in Region B loses about a second and is back in 11 minutes.",
  limits: "Made-up size, speeds and a nightly backup at 02:00. Real restores depend on the storage, the engine and the load, and a drill (19.3 beat 5) is the only way to know yours.",
  component: FailureTimeCanvas,
};
