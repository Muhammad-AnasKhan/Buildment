import type { CustomCanvasSpec } from "../registry";
import { BreakerPlayCanvas } from "./BreakerPlayCanvas";

// 16.5 beat 2, "Tap Picks, watch the breaker". Model: ./model.ts, the breaker
// of chapter 16.7 (createBreaker) on a fake clock.
export const sysdesignM16BreakerPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Tap Picks, watch the breaker",
  purpose: "Checkout calls Picks 10 times a second through a circuit breaker. Tap Picks to break it and the breaker opens after five failures in a row; it then sends one probe call every 10 seconds. Tap Picks again to fix it and see how long the breaker still waits.",
  limits:
    "The model is exact and has no randomness: 10 calls a second, a working call takes 40 ms, a call to a broken Picks fails after a 300 ms time limit, the breaker needs 5 failures in a row and stays open for 10 s. The times, the rate and the threshold are course numbers. Time on screen runs twice as fast as the clock in the picture. A real breaker also has to count failures per instance, pick a threshold and open time from data, and give the page a fallback while it is open.",
  component: BreakerPlayCanvas,
};
