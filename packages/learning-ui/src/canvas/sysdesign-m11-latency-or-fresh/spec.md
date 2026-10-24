# Canvas spec: sysdesign-m11-latency-or-fresh

- **Course and chapter:** system-design, 11.7, beat 3 "No cut: pay in time or in freshness".
- **Renderer:** custom beat canvas on `BeatFrame`, `use-beat-clock.ts`, a `RailSlider` rail inside the picture and `SvgNode` cards; model in `models/far-copy.ts`. The toggle is a pressed `BeatButton` (`BeatToggle` does not exist in `beat-frame.tsx`). The far copy's card slides along as the rail moves.
- **Claim:** With no partition, waiting for a faraway copy buys freshness and costs the round trip. Not waiting is fast, and readers near the far copy are stale for one one-way trip.
- **Model:** disk write with fsync 0.3 ms; R is the round trip to the far copy. Waits: write time 0.3 + R ms, stale window 0. Does not wait: 0.3 ms, stale window R / 2 ms. Rungs: same region 0.25 ms; North America East to West 60 ms; EU West to North America East 80 ms; EU West to Singapore 160 ms (napkin-math round trips).
- **Check points (tested):** 0.25: waits 0.55 ms, no wait 0.3 ms, stale about 0.1 ms (0.125). 60: 60.3 / 0.3 / 30. 80: 80.3 / 0.3 / 40. 160: 160.3 / 0.3 / 80.
- **Inputs:** a snapped rail with the four round trips (default 60 ms; arrow keys step one rung) and one toggle, "Write waits for the far copy: on/off" (default on). Hint: "Drag the far copy; switch the wait." An in-picture button, "Tap: East reads", reads the East copy at that moment of the loop.
- **What moves:** a dot travels to the far copy (and an acknowledgement dot returns when the write waits); the writer's wait bar fills to scale up to 20 ms with a break mark beyond; the stale-window bar fills when the write does not wait; the East reader's tap shows `x = 1, old: stale` inside the window, `x = 2, the new value` after it, and `x = 1, write not done` before the write is done. With reduced motion the frame shows the end of the loop and a tap reads in the middle of the stale window.
- **Verdicts:** waits "Fresh; the write takes {t} ms" (30 characters at most); does not wait "Fast: 0.3 ms; far reads stale {s} ms" (36 at most).
- **Sources:** [S3] napkin-math round trips and fsync write; [S57] PACELC.
