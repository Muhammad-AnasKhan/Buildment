# Canvas spec: sysdesign-m11-balance-back

- **Course and chapter:** system-design, 11.1 beat 1 ("Her balance went back in time").
- **Renderer:** `scene` (data only).
- **Claim:** A copy that has not received a change yet will still answer, so a user can see a newer balance and then an older one.
- **Story:** Mariam deposits 500. Copy A holds 1,500 and the app shows it. She opens the balance again, copy B answers with 1,000. Verdict: "Her balance went back in time".
- **Numbers:** Course numbers (1,000 and a deposit of 500).
- **Sources:** Terry et al. 1994 [S50] for the idea that a session should not see time go backwards; chapter 8.4 for the same effect on a comment.
