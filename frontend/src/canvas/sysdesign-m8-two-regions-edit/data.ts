import type { CustomCanvasSpec } from "../registry";
import { TwoRegionsEditCanvas } from "./TwoRegionsEditCanvas";

// 8.6 beat 2: the EU edit is at 0 ms, the Singapore edit at b (-150 to +150 ms).
// A copy takes 80 ms, half of the 160 ms EU West to Singapore round trip [S3].
// The edits clash when |b| < 80 ms. Last writer wins drops one without a message.
// Model: ./model.ts.
export const sysdesignM8TwoRegionsEdit: CustomCanvasSpec = {
  kind: "custom",
  title: "Two regions edit one document",
  purpose: "Drag the Singapore edit along the timeline and see when the two edits clash, because each region accepted its own before the other's copy arrived; switch on last writer wins to see one edit dropped.",
  limits: "Fixed 80 ms copy time and two edits. Real clocks differ by milliseconds, so \"later\" can be wrong (chapter 10.6).",
  component: TwoRegionsEditCanvas,
};
