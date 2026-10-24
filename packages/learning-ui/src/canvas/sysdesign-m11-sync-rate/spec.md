# Canvas spec: sysdesign-m11-sync-rate

- **Course and chapter:** system-design, 11.6, beat 2 "The sync interval sets the clock".
- **Renderer:** custom beat canvas on `BeatFrame`, `use-beat-clock.ts` and two `RailSlider` rails inside the picture; model in `models/sync-rate.ts`; the seeded generator is `sim/random.ts` (mulberry32).
- **Claim:** The time for all copies to agree is the number of rounds times the sync interval. The number of rounds grows slowly with the number of copies.
- **Model:** N copies, one write on copy 1. Each round every copy picks one other copy at random (floor(random * (N - 1)), plus 1 if that is at least its own number) and the pair both end with the newer value if either had it at the start of the round. Average rounds (20,000 runs per size, seed 42, course experiment): 3 copies 1.50, 5: 2.36, 8: 3.12, 16: 4.15, 32: 5.11; 95 of 100 runs finish within 2, 3, 4, 5, 6 rounds. Time to agree = average rounds x interval (5 copies: 0.5 s gives 1.2 s, 1 s 2.4 s, 2 s 4.7 s, 5 s 11.8 s, 10 s 23.6 s, 30 s 70.8 s).
- **Fixed run (tested):** the first run of the seeded generator takes 1 round for 3 copies, 2 for 5, 5 for 8, 4 for 16 and 4 for 32. The animation plays that run; the banner shows the average and the limits fold says so.
- **Inputs:** two snapped rails in the picture: sync interval 0.5, 1, 2, 5, 10, 30 s (default 2) and copies 3, 5, 8, 16, 32 (default 5). Arrow keys step one rung; Home and End go to the ends. Outside the picture: Replay. Hint: "Drag both rails and compare."
- **What moves:** copies on a ring (lit dot has the value), lines flash between the pairs that swap in each round, a clock ring in the middle grows to the run's length, a bar on the seconds axis grows to the elapsed time and a marker shows the average. Dots change colour with CSS transitions; with reduced motion the final frame shows every copy lit.
- **Verdict:** "About {t} s until all {N} agree" (at most 31 characters).
- **Sources:** [S45] anti-entropy in Dynamo; [S75] convergence. The table is a course experiment.
