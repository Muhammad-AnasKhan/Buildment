# Canvas spec: sysdesign-clock-band

- **Course and chapter:** system-design, 10.6 beat 2 ("Every clock is a little wrong").
- **Renderer:** custom beat canvas on `BeatFrame` and `useBeatClock`.
- **Claim:** A clock does not know the real time; an honest clock reports a band (earliest, latest) that always contains it. Its half-width is epsilon.
- **Motion:** real time wanders across a 30 ms axis; the clock's reading drifts inside epsilon. Loops forever while on screen; reduced motion shows one still frame.
- **Input:** epsilon, 1 to 10 ms in 0.5 ms steps, default 4. Press and drag sideways anywhere on the picture (epsilon follows the distance from the dot to the finger; motion freezes while pressed). Arrow keys when focused.
- **Rule:** `clockBandFrame(seconds, epsilon)` in `model.ts`: `real = 13 + 5 sin(0.5 t)`, `error = 0.85 eps sin(1.1 t)`, band `[real + error - eps, real + error + eps]`. Tested: the band always contains real time.
- **Sources:** Corbett et al., Spanner, OSDI 2012 (TT.now() returns earliest and latest; epsilon sawtooth about 1 to 7 ms).
