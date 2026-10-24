# Canvas spec: sysdesign-m6-rest-round-trips

- **Course and chapter:** system-design, 6.2 beat 1 ("REST: one address per thing").
- **Renderer:** `scene` (data only).
- **Claim:** With REST, a screen that needs linked resources pays one round trip per dependent step; from far away those trips dominate.
- **Story:** The phone in Singapore asks for book 42; the reply names seller 7 (trip 1, 160 ms); the phone then asks for the seller and the reviews together (trip 2, 320 ms in total). Verdict: "3 requests, 2 round trips: 320 ms".
- **Numbers:** 160 ms per round trip, EU West to Singapore [S3]. Server work time is left out.
- **Sources:** [S3] napkin-math round trips. Kitabi is a course example. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
