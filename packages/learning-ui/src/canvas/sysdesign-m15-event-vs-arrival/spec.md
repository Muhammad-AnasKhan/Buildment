# Canvas spec: sysdesign-m15-event-vs-arrival

- **Course and chapter:** system-design, 15.6 beat 1 ("When it happened is not when it arrived").
- **Renderer:** `scene` (data only).
- **Claim:** Event time (when it happened) and arrival time (when we hear about it) differ, so counting by arrival puts the sale in the wrong minute.
- **Story:** The tablet records a sale at 0:50. It has no signal. It reconnects and sends the sale at 2:10. The counter hears about it 80 seconds late. Verdict: "Sold at 0:50, arrived at 2:10".
- **Numbers:** Course numbers: sold at 50 s, arrived at 130 s.
- **Sources:** S87 (Flink: event time versus processing time) and the Flink time concepts page, read 2026-10-24 (see the chapter's source note).
