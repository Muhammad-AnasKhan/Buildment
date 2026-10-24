# Canvas spec: sysdesign-m6-key-replay

- **Course and chapter:** system-design, 6.4 beat 2 ("Same key, same answer").
- **Renderer:** `scene` (data only).
- **Claim:** An idempotency key lets the server answer a retry with the saved result instead of doing the work again.
- **Story:** Huda's Pay carries key k7; the provider charges once and replies; the API saves the reply under k7; the phone has timed out and retries with k7; the API finds the saved reply and returns it. Verdict: "Retry got the saved reply: 1 charge".
- **Numbers:** the 10-second timeout is a made-up course number.
- **Sources:** [S80] Stripe idempotent requests (the server saves the first result for a key and returns it for retries).
