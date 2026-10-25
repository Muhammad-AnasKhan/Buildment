# Canvas spec: sysdesign-m6-key-race

- **Course and chapter:** system-design, 6.4 beat 3 ("Claim the key before you charge").
- **Renderer:** `scene` (data only).
- **Claim:** Claiming the key atomically before the work closes the gap that check-then-save leaves: only one request with a key can do the work.
- **Story:** Try 1 claims k7 with SET NX and starts the charge; try 2 arrives during the charge, its SET NX fails ("taken: refuse"); the API answers 409 "still running"; the phone waits to ask again; the provider shows one charge. Verdict: "Second try refused: 1 charge".
- **Numbers:** none.
- **Predict before it (in the chapter):** how many charges a check-then-save design makes when the retry lands during the charge.
- **Sources:** [S80] Stripe idempotent requests. Valkey `SET NX` semantics are a source-needed note in the chapter; challenge 5 part 4 measures the same race.
