import type { CustomCanvasSpec } from "../registry";
import { FanOutPlayCanvas } from "./FanOutPlayCanvas";

// 2.4: one page calls n backends at once and waits for the slowest. Each call
// is slow 1 time in 100, so the page is slow with chance 1 - 0.99^n.
// Model: models/fan-out.ts.
export const sysdesignM2FanOutPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "One slow call makes a slow page",
  purpose: "Drag how many backends one page calls and watch the page loads: each backend is slow 1 time in 100, but the page waits for the slowest, so slow pages become common.",
  limits:
    "Assumes each call is slow 1 time in 100, independently of the others, as in the example in Dean and Barroso's The Tail at Scale (100 calls gives 63%). Real slow moments are often linked, for example one busy network switch slows many calls at once. Fast calls take 8 to 15 ms and slow ones 1 s; the replies are slowed down so you can watch them. The page loads come from a fixed random sequence, so the tally wanders around the true chance and gets closer the more loads you run.",
  component: FanOutPlayCanvas,
};
