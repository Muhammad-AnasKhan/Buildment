# Canvas spec: sysdesign-m10-hlc-catch-up

- **Course and chapter:** system-design, 10.5 beat 5 ("The counter climbs until the clock catches up").
- **Renderer:** `scene` (data only).
- **Claim:** While a node's clock is behind the biggest time it has seen, the hybrid stamp keeps that time and counts events in the counter; when the clock passes it, the stamp follows the clock and the counter resets.
- **Story:** B at (100, 1) with clock 70. Events at clock 80, 92, 105 give (100, 2), (100, 3), (105, 0). Verdict: "Clock catches up: counter resets".
- **Numbers:** Course numbers, computed with the reference HybridClock of chapter 10.8.
- **Sources:** S59.
