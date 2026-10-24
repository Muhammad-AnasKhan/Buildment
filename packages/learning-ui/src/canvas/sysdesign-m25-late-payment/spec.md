# Canvas spec: sysdesign-m25-late-payment

- **Course and chapter:** system-design, 25.2 beat 6 ("A late payment must not take a re-held seat").
- **Renderer:** `scene` (data only).
- **Claim:** A hold can expire while the buyer is still paying. Before the seat is sold, the confirm step must check that this buyer's hold is still the current one. If it is not, the authorization is voided and the buyer is told the seat is gone.
- **Story:** Dina holds seat 7 until 10:10 and is slow. The hold expires, Omar holds the seat until 10:20. Dina's payment is authorized at 10:11. The confirm for Dina is refused. The authorization is voided. Verdict: "Check the hold again before selling".
- **Numbers:** 10-minute hold, times 10:10, 10:11, 10:20 (course example).
- **Sources:** Course story. Fencing tokens as the general idea: a stale holder is refused by the store [S70].
