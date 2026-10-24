# Canvas spec: sysdesign-m7-dirty-read

- **Course and chapter:** system-design, 7.4 beat 2.
- **Renderer:** `scene` (data only).
- **Claim:** A dirty read is reading data that another transaction has written but not committed. If that transaction rolls back, the reader acted on a value that never existed.
- **Story:** The writer sets left to 0, uncommitted. The reader sees 0 and shows sold out. The payment fails, the writer rolls back, and left is 1 again.
- **Numbers:** Seats left: 1, then 0 (uncommitted), then 1 again.
- **Predict before it (in the chapter):** none. The beat text asks the learner what to notice.
- **Sources:** PostgreSQL 18 docs, transaction isolation: Read Uncommitted behaves like Read Committed; dirty read is not possible (read 2026-10-24).
