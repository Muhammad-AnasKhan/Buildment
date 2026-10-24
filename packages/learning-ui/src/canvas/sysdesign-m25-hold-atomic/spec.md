# Canvas spec: sysdesign-m25-hold-atomic

- **Course and chapter:** system-design, 25.2 beat 5 ("One statement, no waiting").
- **Renderer:** `scene` (data only).
- **Claim:** A single conditional update ("hold this seat if it is free or its hold has expired") needs no lock held across other work. One request wins, the others get a clear refusal at once and can try another seat.
- **Story:** Dina and Omar both send "hold if free" for seat 7. The store applies them one after the other. Dina gets a 10-minute hold. Omar gets 409 "taken", tries seat 8, and gets it. Verdict: "The loser moves on at once".
- **Numbers:** 10-minute hold (course choice). No other numbers.
- **Sources:** Conditional writes stop a lost update and are idempotent when the condition checks the attribute being changed [S42]; compare-and-set in chapter 7.5.
