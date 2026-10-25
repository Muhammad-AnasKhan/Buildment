# Canvas spec: sysdesign-m10-hlc-rule

- **Course and chapter:** system-design, 10.5 beat 2 ("The hybrid clock keeps the later time").
- **Renderer:** `scene` (data only).
- **Claim:** Hybrid logical clock receive: l = max(own l, message l, own clock); the counter breaks ties so the new stamp is bigger than both the old stamp and the message stamp.
- **Story:** A sends (100, 0). B reads 70, keeps 100, counter becomes 0 + 1. Verdict: "Receive gets (100, 1): after send".
- **Numbers:** Course numbers, matching the previous beat; computed with the reference HybridClock of chapter 10.8.
- **Sources:** S59.
