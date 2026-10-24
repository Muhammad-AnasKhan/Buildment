import type { CustomCanvasSpec } from "../registry";
import { TwoClocksCanvas } from "./TwoClocksCanvas";

export const sysdesignTwoClocks: CustomCanvasSpec = {
  kind: "custom",
  title: "Two servers stamp two writes 1 ms apart",
  purpose: "Two clocks tick in slow motion and stamp two writes .000 and .001, which looks like a clear order.",
  limits: "Time is slowed down about 200 times so you can see the milliseconds tick. Both clocks are drawn as if they were right; the next pictures show that real clocks are not.",
  component: TwoClocksCanvas,
};
