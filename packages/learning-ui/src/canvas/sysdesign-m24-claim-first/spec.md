# Canvas spec: sysdesign-m24-claim-first

- **Course and chapter:** system-design, 24.4 beat 4 (Claim the driver first).
- **Renderer:** `scene` (data only).
- **Claim:** A compare-and-set claim on the driver's state lets only one search win a driver.
- **Story:** Both searches claim D; D's record accepts A and refuses B; A sends its offer; B moves on to the next driver.
- **Numbers:** Claim time-out: 10 s, the same as the offer time-out.
- **Sources:** None. The pattern is compare-and-set, chapter 7.5.
