# Canvas spec: sysdesign-m7-mvcc-versions

- **Course and chapter:** system-design, 7.5 beat 5.
- **Renderer:** `scene` (data only).
- **Claim:** With multiversion concurrency control (MVCC), a write adds a new version and a read picks the version that was current for it, so reading never blocks writing and writing never blocks reading.
- **Story:** The writer adds version 2 (pending). The reader reads version 1 without waiting. The writer commits. The next read returns version 2.
- **Numbers:** Seats left: 1 in version 1, 0 in version 2.
- **Predict before it (in the chapter):** none. The beat text asks the learner what to notice.
- **Sources:** PostgreSQL docs, MVCC introduction: each statement sees a snapshot; reading never blocks writing and writing never blocks reading (read 2026-10-24).
