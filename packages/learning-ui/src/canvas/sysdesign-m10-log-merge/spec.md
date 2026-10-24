# Canvas spec: sysdesign-m10-log-merge

- **Course and chapter:** system-design, 10.1 beat 1 ("Two logs, one story, wrong order").
- **Renderer:** `scene` (data only).
- **Claim:** Sorting two servers' log lines by their own clocks can put an effect before its cause, even when a message links them.
- **Story:** The payments server (clock 60 ms fast) stamps "paid" .060 and sends a message. The orders server (correct clock) gets it 12 ms later and stamps "confirmed" .012. The merged log sorts by timestamp and lists "confirmed" first. Verdict: "Log says confirmed before paid".
- **Numbers:** 60 ms = 50 ppm x 1,200 s (course arithmetic from the drift figure in S52); the 12 ms travel time is invented. The shop (Souq) is a fictional composite.
- **Sources:** S52 (Kleppmann notes: drift up to 50 ppm).
