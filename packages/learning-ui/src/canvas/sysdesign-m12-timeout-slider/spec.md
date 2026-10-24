# Canvas spec: sysdesign-m12-timeout-slider

- **Course and chapter:** system-design, 12.2 ("Why agreement is hard"), beat 2 "Drag the timeout, watch the price". New slug.
- **Renderer:** custom beat canvas on `BeatFrame`: `SvgNode` cards for the node and the monitor, `LinkLine`, a strip of 40 bars, one `RailSlider` with `SliderRail`, `DotGrid`, `VerdictBanner`, the beat clock for the sweep. Model: `models/failure-timeout.ts`.
- **Claim:** A short failure timeout notices a real crash sooner but raises many false alarms on healthy nodes. A long timeout is calm and slow. The false alarms fall steeply at first and then flatten.
- **Model:** a node sends a beat every 1,000 ms. A beat takes 10 ms plus a random extra with a mean of 30 ms (exponential). The monitor suspects the node when the gap between two arrivals is longer than the timeout T. The gap is 1,000 ms plus the difference of two delays, which is Laplace with scale 30 ms.
  - T at least 1,000 ms: P(false alarm per beat) = 0.5 x exp(-(T - 1,000) / 30). T below 1,000 ms: P = 1 - 0.5 x exp((T - 1,000) / 30).
  - False alarms per hour = 3,600 x P (one beat a second). Average time to notice a real crash = T - 460 ms.
- **Input:** T on a linear rail from 900 to 2,000 ms, step 10 ms, snap points 900, 1,000, 1,050, 1,100, 1,150, 1,200, 1,300, 1,500, 2,000 (a drag within 10 ms of one lands on it). Arrow keys step 10 ms, Page keys 100 ms. Default 1,100.
- **Numbers (formula):** 900: 3,536 an hour, 440 ms. 1,000: 1,800, 540. 1,050: 340, 590. 1,100: 64.2, 640. 1,150: 12.1, 690. 1,200: 2.29, 740. 1,300: 0.08, 840. 1,500: 0.0001, 1,040. 2,000: 0, 1,540. (The spec lists 3,535 at 900 ms; the formula gives 3,535.8, shown as 3,536.)
- **Picture:** the node sends a dot along a link to the monitor; below, 40 bars from a fixed seeded run (seed 7) show the gaps between beat arrivals, with a dashed line at T. Bars above the line are red. A sweep walks along the bars (4 a second); on a red bar the monitor card turns red and says "suspects!". Two cards give "false alarms per hour" and "a crash is noticed after". The bar scale runs from 850 to 1,350 ms; a line above 1,350 ms rests at the top edge and its label still gives the true value.
- **Verdicts:** at least 10 an hour "340 false alarms an hour" (bad); 0.5 to 10 "About 2 false alarms an hour" (warn); under 0.5 "Calm: a crash is seen in 840 ms" (good). All at most 38 characters.
- **Reduced motion:** no sweep, no moving dot; the monitor card states the count of red bars ("N alarms" or "no alarms"). Bar colours change with a CSS transition, so a frozen frame is always correct.
- **Accessibility:** the rail is a `role="slider"` with value text "timeout 1,100 ms, 64 false alarms an hour, a crash seen after 640 ms"; the SVG description gives the same figures.
- **Sources:** Raft timing requirement and ranges [S68]; phi accrual trade-off [S73]. The delay model and all figures are course numbers.
