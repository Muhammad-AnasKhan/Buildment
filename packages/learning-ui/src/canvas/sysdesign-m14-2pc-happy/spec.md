# Canvas spec: sysdesign-m14-2pc-happy

- **Course and chapter:** system-design, 14.2 beat 1 (Ask first, then decide).
- **Renderer:** `scene` (data only).
- **Claim:** Phase one collects promises. Phase two carries out the one decision. Nobody commits before everybody has promised.
- **Story:** Coordinator sends prepare to Stock DB and Payments DB. Both lock their rows and vote yes. Coordinator sends commit to both. Verdict: both commit, or both abort.
- **Numbers:** No numbers.
- **Sources:** S77 (Gray and Lamport) for the protocol shape.
