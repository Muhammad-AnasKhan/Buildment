# Canvas spec: sysdesign-m7-txn-crash

- **Course and chapter:** system-design, 7.4 beat 1.
- **Renderer:** `scene` (data only).
- **Claim:** Two writes that must go together need a transaction. Without one, a crash between them leaves the data half changed.
- **Story:** The app takes 40 from the venue's balance. The app crashes. Dina's balance never changes. Verdict: '40 left the venue, reached no one'.
- **Numbers:** Venue 500 to 460. Dina stays at 0.
- **Predict before it (in the chapter):** none. The beat text asks the learner what to notice.
- **Sources:** Course example. Atomicity (all or nothing): PostgreSQL documentation, transactions tutorial.
