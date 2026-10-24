# Canvas spec: sysdesign-m22-retry-backoff

- **Course and chapter:** system-design, 22.5 beat 4 ("A busy provider").
- **Renderer:** `scene` (data only).
- **Claim:** A provider that is busy needs fewer calls, not more. Workers retry with a wait that grows after each failure and has a random part, so they spread out.
- **Story:** The SMS worker takes a "send code" job from the queue and calls the provider. The provider answers 503. The worker waits 1 second, tries again, gets 503 again, waits 2 seconds, tries a third time and succeeds. Verdict: "Wait longer each time, then send".
- **Numbers:** Course numbers: waits of 1 s and 2 s.
- **Sources:** Backoff and jitter [S90]; retries at one layer and a retry limit [S89, S91]; chapter 15.5.
