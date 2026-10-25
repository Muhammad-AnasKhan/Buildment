# Canvas spec: sysdesign-m12-log-commit

- **Course and chapter:** system-design, 12.6 beat 1 (Copy it, count it, commit it).
- **Renderer:** `scene` (data only).
- **Claim:** An entry is committed once the leader has it and a majority of servers have copied it. The leader can then answer the client without waiting for the slowest server.
- **Story:** x = 5 goes to the leader, then to S2 and S3. S2's ok makes 2 of 3, a majority. The leader commits and tells the client. S3 stores the entry a moment later.
- **Numbers:** Cluster of 3, majority 2.
- **Sources:** S68 (commit rule).
