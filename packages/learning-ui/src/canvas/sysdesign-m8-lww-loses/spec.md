# Canvas spec: sysdesign-m8-lww-loses

- **Course and chapter:** system-design, 8.6 beat 3 ("Last writer wins, and one edit is lost").
- **Renderer:** `scene` (data only).
- **Claim:** Last writer wins converges, but it throws away one of two concurrent edits.
- **Story:** The EU leader writes "Plan v2" at t = 10 ms and the Singapore leader writes "Plan v3" at t = 12 ms. The copies cross. Each leader compares timestamps and keeps the later one, v3. Verdict: "Plan v2 was lost; nobody was told".
- **Numbers:** timestamps are illustrative.
- **Sources:** DynamoDB global tables: last writer wins per item [S43]; Kleppmann: LWW implies data loss [S52]; Jepsen 2013 Cassandra test, about 28% of acknowledged writes lost [S76].
