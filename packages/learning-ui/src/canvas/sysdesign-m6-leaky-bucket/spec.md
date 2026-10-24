# Canvas spec: sysdesign-m6-leaky-bucket

- **Course and chapter:** system-design, 6.5 beat 3 ("Leaky bucket: a steady drip out").
- **Renderer:** `scene` (data only).
- **Claim:** A leaky bucket turns a burst into a steady flow: requests beyond the rate wait in a bounded queue, and requests beyond the queue are refused.
- **Story:** 7 requests arrive; the first goes on at once, 3 wait, 3 are refused; the queue drains one a second until empty. Verdict: "Smooth flow out; extras wait or fail".
- **Numbers:** 1 a second and a queue of 3 are made up.
- **Sources:** [S31] nginx limit_req (leaky bucket, burst, nodelay, 503 by default).
