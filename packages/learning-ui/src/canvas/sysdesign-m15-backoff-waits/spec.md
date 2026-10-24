# Canvas spec: sysdesign-m15-backoff-waits

- **Course and chapter:** system-design, 15.5 beat 3 ("Wait longer each time").
- **Renderer:** `scene` (data only).
- **Claim:** Backoff gives a failing service more room each time instead of hammering it.
- **Story:** Four tries are placed on a time line: at 0, 1, 3 and 7 seconds. The first three fail. The fourth works, because the service has had 7 seconds to recover. Verdict: "Waits double: 1, 2, 4 seconds".
- **Numbers:** Course numbers: first wait 1 s, doubling.
- **Sources:** S89 and S90 (AWS Builders' Library and Architecture Blog: exponential backoff).
