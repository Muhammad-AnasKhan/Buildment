# Canvas spec: sysdesign-m16-timeout-line

- **Course and chapter:** system-design, 16.4 beat 2, "Drag the limit and see the price". Playable; new slug.
- **Renderer:** custom beat canvas on `BeatFrame`: Checkout and Picks cards, 50 bars on a log scale with a limit line, two price cards (calls cut off, workers held in a hang with a bar against 50), one `SnapStopsRail`, `VerdictBanner`. No toggle.
- **Claim:** A short timeout cuts off calls that would have worked; a long timeout lets a hanging dependency hold many workers. The right limit sits near the latency percentile you accept as false timeouts, and the pool size must be checked against it.
- **Input:** limit on a snap rail 50, 100, 150, 250, 400, 500, 600, 900, 1,000 ms (default 250); arrow keys move one snap point.
- **Model** (`model.ts`): latency of a call to Picks is the quantile Q(u) interpolated linearly in log latency between (0, 15), (0.5, 40), (0.9, 80), (0.99, 250), (0.999, 900), (1, 3000) ms. Share cut off is 1 minus F(T), F the inverse of Q. Workers held in a hang at 100 pages a second are 100 x T. Pool 50. The mean hold with a limit is an exact integral.
- **Numbers to check** (tested): cut off 37.1%, 8.2%, 5.0%, 1.0%, 0.67%, 0.51%, 0.38%, 0.10%, 0.09% for 50 to 1,000 ms; held 5, 10, 15, 25, 40, 50, 60, 90, 100; busy when healthy 3.7, 4.6, 4.9, 5.2, 5.3, 5.4, 5.4, 5.5, 5.5; mean latency 55.6 ms.
- **Picture:** 50 bars at u = (i + 0.5) / 50, sorted, bars above the line red; the bars stop at p99 (250 ms), the tail beyond comes only from the formula in the cut-off card. A sweep walks the bars and Picks shows the call under it.
- **Verdicts:** held above 50 "A hang takes 90 of 50 workers" (bad); cut off 5% or more "37% of good calls cut off" (warn); otherwise "1% cut; a hang holds 25 of 50" (good).
- **Reduced motion:** no sweep and no dot; the line jumps.
- **Accessibility:** the rail is a `role="slider"` with value text "limit 250 ms, 1.0 percent of calls cut off, a hang holds 25 of 50 workers".
- **Sources:** timeout from the percentile you accept as false timeouts, p99.9 in Brooker's example [S89]; Little's law from chapter 2.5. The latency points are course numbers.
