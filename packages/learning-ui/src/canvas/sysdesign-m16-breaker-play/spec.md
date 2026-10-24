# Canvas spec: sysdesign-m16-breaker-play

- **Course and chapter:** system-design, 16.5 beat 2, "Tap Picks, watch the breaker". Playable; new slug.
- **Renderer:** custom beat canvas on `BeatFrame`: Checkout, a breaker pill (Closed green, Open red, Half-open amber), a tappable Picks card, two number cards (time, calls that reached Picks), a strip of the last 60 calls as dots, `VerdictBanner`. Controls outside the picture: Replay and Pause.
- **Claim:** A breaker opens after a run of failures, so a failing dependency gets almost no calls, and it probes with one call at a time to find out when the dependency is back.
- **Input:** tap Picks to break it or fix it. Time runs by itself at 10 calls a second, twice as fast as the clock in the picture (one model second takes 0.5 s on screen).
- **Model** (`model.ts`): the breaker of chapter 16.7 (`createBreaker`: five failures in a row, open 10,000 ms, one probe in half-open, a late success while open is ignored), written as small pure steps and also as the `createBreaker` factory, driven by a fake clock. A call to a healthy Picks takes 40 ms and works; a call to a broken Picks fails after 300 ms; the breaker is asked before each call and a refused call fails at once.
- **Scripted run to check** (tested, `scriptedRun`; Picks broken at 5.0 s, fixed at 35.0 s): open at 5.70 s, half-open at 15.70 s (probe fails at 16.00 s), 26.00 s (probe fails at 26.30 s), 36.30 s (probe works, closed at 36.34 s). In the outage 300 calls, 9 reached Picks (7 plus 2 probes), 304 refused over 600 calls. After the fix at 35.0 s the page waits 1.3 s for the probe.
- **Dots:** green worked, red failed, grey refused, amber probe, hollow blue still waiting for an answer. Oldest first, 30 to a row.
- **Verdicts:** "Closed: calls go through" (good); "Closed: N of 5 failures so far" (warn, while Picks is broken and the breaker still counts); "Open: no calls reach Picks" (warn); "Half-open: one probe call" (accent); "Picks is back; waiting to probe" (warn); after an outage "9 of 300 calls reached Picks" (good, numbers filled in).
- **Reduced motion:** the strip starts filled and nothing scrolls by itself. A tap jumps to the settled picture: 3 s after a break (open), 12 s after a fix (closed again).
- **Accessibility:** the Picks card is a toggle button "Picks: healthy, press to break it"; the breaker pill is text; the verdict is repeated in an `aria-live` region.
- **Sources:** circuit breaker states [S92]. Times, rates and the threshold are course numbers; the timeline is computed with the course's own breaker.
