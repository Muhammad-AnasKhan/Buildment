# Canvas spec: sysdesign-m22-dedupe-key

- **Course and chapter:** system-design, 22.5 beat 3 ("The same event must send once").
- **Renderer:** `scene` (data only).
- **Claim:** A queue or a retrying caller can deliver one event more than once. A key written with "add only if absent" lets exactly one copy through. The key must outlive the longest possible retry.
- **Story:** The chat service sends event e91. The notifier adds e91 to the seen-keys store (it was absent), then asks the push service to send one alert. The chat service sends e91 again. The add finds the key already there, so the notifier drops the copy. Verdict: "Same event, one push".
- **Numbers:** None in the picture. The chapter uses a 24 hour key time as an example.
- **Sources:** At-least-once delivery [S83]; idempotency keys kept for at least 24 hours in Stripe's API [S80]; chapter 14.5 on how long to remember ids.
