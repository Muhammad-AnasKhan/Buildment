# Canvas spec: sysdesign-m15-poison-blocks

- **Course and chapter:** system-design, 15.5 beat 1 ("One bad message stops the line").
- **Renderer:** `scene` (data only).
- **Claim:** In an ordered partition, a message that always fails stops everything behind it.
- **Story:** The consumer handles m1. It fails on m2, waits 1 second and tries again, and fails again. m3 and m4 cannot start. Verdict: "One bad message stops the line".
- **Numbers:** Course number: 1 s between tries.
- **Sources:** S81 (a partition is read in order); SQS FIFO behaves the same for a message group (S84).
