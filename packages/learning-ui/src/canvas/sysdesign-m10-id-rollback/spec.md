# Canvas spec: sysdesign-m10-id-rollback

- **Course and chapter:** system-design, 10.7 beat 5 ("A clock stepped back repeats an ID").
- **Renderer:** `scene` (data only).
- **Claim:** A generator that trusts the clock re-issues IDs when the clock is stepped back, because time, worker and sequence repeat.
- **Story:** Worker 7 issues 996-7-0, reaches clock 1000, the clock is stepped back to 996, and it issues 996-7-0 again. Verdict: "Same ID twice: the insert fails".
- **Numbers:** Course numbers (4 ms step, worker 7).
- **Sources:** S65 (Snowflake guards against clocks going backwards).
