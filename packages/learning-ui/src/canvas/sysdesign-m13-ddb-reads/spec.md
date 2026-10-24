# Canvas spec: sysdesign-m13-ddb-reads

- **Course and chapter:** system-design, 13.4 beat 3 ("Two kinds of read").
- **Renderer:** `scene` (data only).
- **Claim:** DynamoDB offers eventually consistent reads from any copy and strongly consistent reads from the leader.
- **Story:** The client asks the replica for x and gets 7. It then asks the leader with a strong read and gets 8. Verdict: "Strong reads go to the leader".
- **Numbers:** No numbers. Story only.
- **Sources:** S44 (DynamoDB: strongly and eventually consistent reads; only the leader serves writes and strongly consistent reads).
