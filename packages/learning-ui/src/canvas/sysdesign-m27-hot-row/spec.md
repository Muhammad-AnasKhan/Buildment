# Canvas spec: sysdesign-m27-hot-row

- **Course and chapter:** system-design, 27.5 beat 1 ("One popular video is one hot row").
- **Renderer:** `scene` (data only).
- **Claim:** Many writers adding to one row must take turns, so a single row has a top speed however many servers push on it.
- **Story:** Three app servers send "+1" to the same row. The row takes one at a time; the others show "waiting" and the row shows "line grows". Verdict: "One row: one write at a time".
- **Numbers:** a DynamoDB partition is designed for 1,000 write units a second [S40]; a viral video at 5,000 views a second is five times that (chapter 27.5).
- **Sources:** S40, chapter 7.5 (locks and compare-and-set).
