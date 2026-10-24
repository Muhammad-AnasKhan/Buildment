# Canvas spec: sysdesign-m15-log-replay

- **Course and chapter:** system-design, 15.3 beat 5 ("Rewind and read again").
- **Renderer:** `scene` (data only).
- **Claim:** Because a log keeps events, a reader can go back and process them again.
- **Story:** Stats is at 100 and finds a bug. It rewinds to 40. The log sends events 40 to 100 again, and Stats ends at 100 with correct numbers. Verdict: "Rewind to 40 and process again".
- **Numbers:** Course numbers: positions 40 and 100, 7 days retention.
- **Sources:** S82 (Kafka: a consumer can deliberately rewind to an old offset and consume again; the log does not delete on consumption).
