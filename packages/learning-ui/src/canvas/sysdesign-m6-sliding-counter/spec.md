# Canvas spec: sysdesign-m6-sliding-counter

- **Course and chapter:** system-design, 6.5 beat 5 ("Sliding counter: weigh the last window").
- **Renderer:** `scene` (data only).
- **Claim:** A sliding window counter estimates the last 60 seconds from two counters, which stops the boundary burst a fixed window lets through.
- **Story:** 5 at 0:59 are allowed; at 1:00 the estimate is 5 x 100% + 0 = 5, so 5 more are refused; at 1:30 it is 5 x 50% + 0 = 2.5, so 2 of the next 5 fit (2.5 + 1 + 1 = 4.5 is at most 5; a third would make 5.5). Verdict: "Edge burst refused; 2 fit at 1:30".
- **Numbers:** 5 a minute is made up; the formula is Cloudflare's.
- **Sources:** [S29] Cloudflare, counting things (sliding window counter formula; 0.003% error over 400 million requests).
