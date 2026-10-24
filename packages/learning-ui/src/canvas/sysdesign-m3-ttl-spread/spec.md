# Canvas spec: sysdesign-m3-ttl-spread

- **Course and chapter:** system-design, 3.3 ("DNS and routing"), beat 3 ("A change spreads only as caches expire"). New slug.
- **Renderer:** custom beat canvas on `BeatFrame`, with the new `primitives/rail-slider.tsx` and `primitives/svg-chip.tsx`.
- **Claim:** After a DNS change, the share of resolvers that have the new answer grows in a straight line, and every resolver has it after one TTL (S9, RFC 1035). With a TTL of 0 nothing is cached.
- **Model** (`models/ttl-spread.ts`): 20 resolvers; at the moment of the change resolver i holds a copy aged (i + 0.5) / 20 x TTL; it switches at TTL minus that age. So the share on the new answer is min(1, t / TTL), counted in steps of 1/20.
- **Inputs:** TTL chips 0 s, 60 s (the ELB TTL, S15), 5 min, 1 hour, 1 day (the last three are illustrative); a time rail from 0 to 1.2 x TTL (whole percents of the TTL, step 1) with a tick at the TTL. Default: 1 hour. Until the learner drags the rail the clock sweeps by itself; "Play the clock" starts the sweep again.
- **Picture:** an Old and a New server card whose pills count resolvers; the time after the change in the middle; 20 dots, one per resolver, amber on the old address and green with a check on the new one, flipping left to right as their copies expire; legend and TTL chips; the rail.
- **Worked values to check:** TTL 1 hour: 3 of 20 after 10 minutes (about 1 in 6), 10 of 20 after 30 minutes, 20 of 20 after an hour. TTL 60 s: all 20 within a minute. TTL 0: all 20 at once.
- **Numbers visible at once:** the time after the change, the old count and the new count (card pills).
- **Verdicts (38 characters or fewer):** "TTL 0: every lookup gets the change"; "{k} of 20 still on the old address"; "All 20 on the new address"; "1-day TTL: up to a day to move".
- **Motion and reduced motion:** the clock sweeps 0 to 120% of the TTL, pauses at the end and loops; dots change colour with a short CSS transition. With reduced motion the clock does not run and the picture shows the half-way point (10 of 20 at a 1 hour TTL); the rail still works.
- **Accessibility:** the time rail is a `role="slider"` (arrow keys step 1%, Page keys 9%, Home and End to the ends) whose value text says the time and the count; each TTL chip is a `role="button"` with `aria-pressed`; the SVG description states the TTL, the time and both counts.
- **Sources:** S9 RFC 1035 (TTL, zero TTL not cached); S15 AWS Elastic Load Balancing (60 s TTL).
