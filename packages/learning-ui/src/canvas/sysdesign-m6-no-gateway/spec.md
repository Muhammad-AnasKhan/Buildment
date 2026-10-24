# Canvas spec: sysdesign-m6-no-gateway

- **Course and chapter:** system-design, 6.6 beat 1 ("Every service guarding its own door").
- **Renderer:** `scene` (data only).
- **Claim:** Without a gateway, every service repeats the same edge checks, and the copies drift: one of them will be missing.
- **Story:** The phone calls Books (3 checks OK), Payments (3 checks OK) and Search, which forgot its rate limit. Verdict: "Same checks 3 times; one was missed".
- **Numbers:** none.
- **Sources:** none needed; the forgotten limit is a made-up example. Kitabi is a course example.
