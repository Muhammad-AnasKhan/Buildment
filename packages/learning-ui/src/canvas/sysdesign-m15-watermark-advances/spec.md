# Canvas spec: sysdesign-m15-watermark-advances

- **Course and chapter:** system-design, 15.6 beat 3 ("The watermark says time has passed").
- **Renderer:** `scene` (data only).
- **Claim:** A watermark is the counter's claim that no event older than this time is still expected, and it is what closes windows.
- **Story:** Event 30 arrives: watermark 20. Event 55 arrives: watermark 45. Event 70 arrives: watermark 60, which is the end of the first window, so the window 0 to 60 closes with 2 events. Verdict: "Watermark passes 60: window closes".
- **Numbers:** Course numbers: 10 s delay, 60 s window.
- **Sources:** Flink time concepts page, read 2026-10-24: a watermark of t says event time has reached t; S87 (a window fires when the watermark passes its end).
