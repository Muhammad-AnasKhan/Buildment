# Canvas spec: sysdesign-m15-idle-partition

- **Course and chapter:** system-design, 15.6 beat 6 ("One silent input holds the watermark back").
- **Renderer:** `scene` (data only).
- **Claim:** The watermark of an operator with several inputs is the minimum of its inputs, so one silent input stalls it.
- **Story:** Both partitions send event 60. Partition 0 goes on to event 200. Partition 1 says nothing more. The counter takes the minimum: watermark 60. Windows after 60 never close. Verdict: "One silent input holds the watermark".
- **Numbers:** Course numbers: times 60 and 200.
- **Sources:** Flink time concepts and watermark-generation pages, read 2026-10-24: the watermark is the minimum over the inputs, and an idle input holds it back unless marked idle.
