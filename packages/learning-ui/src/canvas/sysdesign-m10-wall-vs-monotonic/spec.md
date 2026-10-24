# Canvas spec: sysdesign-m10-wall-vs-monotonic

- **Course and chapter:** system-design, 10.2 beat 4 ("Time can go backwards on the wall clock").
- **Renderer:** `scene` (data only).
- **Claim:** Durations must be measured with a monotonic clock, because the wall clock can be stepped back.
- **Story:** A job runs 400 ms. The wall clock is stepped back 1 s mid-job: end minus start is 400 - 1000 = -600 ms. The monotonic clock says 400 ms. Verdict: "Wall clock: a negative duration".
- **Numbers:** Invented course numbers. Real case: Cloudflare, 2017-01-01, a leap second made a measured duration negative [S133].
- **Sources:** S133, S52.
