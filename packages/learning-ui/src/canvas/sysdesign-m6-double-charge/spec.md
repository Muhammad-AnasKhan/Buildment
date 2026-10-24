# Canvas spec: sysdesign-m6-double-charge

- **Course and chapter:** system-design, 6.1 beat 1 ("One tap, a timeout, two charges").
- **Renderer:** `scene` (data only).
- **Claim:** A timeout does not mean the request failed. When the app gives up and the user retries, a payment API with no idempotency charges twice.
- **Story:** Huda's phone sends Pay $18; the API asks the provider to charge; the provider charges (charged: 1) but its reply is late; the phone's wait runs to "gave up at 10 s" and asks "try again?"; the late reply reaches the API ("reply too late"); the second Pay is a new payment, charged again (charged: 2). Verdict: "One tap, a timeout, two charges".
- **Numbers:** 10-second timeout, charge at 8 s, reply at 12 s and $18 are a made-up course example.
- **Predict before it (in the chapter):** how many times the card is charged.
- **Sources:** [S89] Brooker, Timeouts, retries and backoff with jitter (a timeout leaves the outcome unknown; side effects need idempotency to be safe to retry). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
