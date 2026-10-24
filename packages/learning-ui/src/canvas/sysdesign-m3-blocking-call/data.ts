import type { CustomCanvasSpec } from "../registry";
import { BlockingCallCanvas } from "./BlockingCallCanvas";

// 3.6, beat 5: 100 requests a second, each needing 1 ms of CPU and 50 ms of
// waiting. A share of them also runs a slow call of B ms. On an event loop
// the ceiling is 1000 / (1 + s B) a second and every request waits behind a
// slow call; on a pool of 8 threads it is 8000 / (51 + s B) and a slow call
// ties up one thread. Model: models/blocking-call.ts.
export const sysdesignM3BlockingCall: CustomCanvasSpec = {
  kind: "custom",
  title: "One blocking call stops everyone",
  purpose: "Drag the length of a slow call and tap how often it runs; on an event loop everything behind it waits, on a thread pool only one thread is stuck but the ceiling is far lower.",
  limits:
    "All the numbers are made up for the picture: every request needs 1 ms of CPU and 50 ms of waiting for a database, 100 requests arrive a second, and the pool has 8 threads. The ceilings come from simple formulas and ignore the cost of switching between threads (about 10 microseconds each), garbage collection, and the cores a real server has. One dot stands for many requests, and the slow calls are drawn on a fixed rhythm, not at random.",
  component: BlockingCallCanvas,
};
