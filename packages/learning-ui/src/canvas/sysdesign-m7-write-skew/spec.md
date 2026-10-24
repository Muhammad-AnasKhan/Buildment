# Canvas spec: sysdesign-m7-write-skew

- **Course and chapter:** system-design, 7.4 beat 4.
- **Renderer:** `scene` (data only).
- **Claim:** Write skew happens when two transactions read the same facts, then write to different rows, and together they break a rule that each one checked.
- **Story:** Both count 2 open gates. A closes north. B closes south. Both commit. Zero gates are open.
- **Numbers:** 2 gates open, then 0.
- **Predict before it (in the chapter):** 7.4, right before this beat: two staff each check that another gate is open, then close their own. Does the database refuse the second close, or do both work and leave no gate? (Answer: both work.)
- **Sources:** Write skew is the anomaly snapshot isolation allows (Jepsen, snapshot isolation, read 2026-10-24) [S46]. Measured on PostgreSQL 18.6 in challenge 6 style tests: course run, 2026-10-24.
