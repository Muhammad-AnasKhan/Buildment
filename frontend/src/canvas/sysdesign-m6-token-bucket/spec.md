# Canvas spec: sysdesign-m6-token-bucket

- **Course and chapter:** system-design, 6.5 beat 2 ("Token bucket: drip in, spend out").
- **Renderer:** `scene` (data only).
- **Claim:** A token bucket allows a burst up to its capacity and then the refill rate.
- **Story:** 7 requests arrive at a full bucket of 5; 5 pass and 2 are refused; the bucket refills to 1, then 2 tokens; one more request spends a token and passes. Verdict: "Burst of 5 now, then 1 a second".
- **Numbers:** capacity 5 and 1 token a second are made up.
- **Sources:** [S30] API Gateway token bucket (rate and burst); [S32] Stripe token buckets.
