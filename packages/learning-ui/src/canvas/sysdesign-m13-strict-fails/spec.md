# Canvas spec: sysdesign-m13-strict-fails

- **Course and chapter:** system-design, 13.3 beat 1 ("A strict quorum can refuse a write").
- **Renderer:** `scene` (data only).
- **Claim:** A strict quorum counts only the key's own N nodes, so too many failures among them stop writes.
- **Story:** The client sends the write to A, B and C. A confirms. B and C are down. The client has 1 of 2 confirmations and gives up. Verdict: "Write refused: only 1 of 2 acks".
- **Numbers:** N = 3, W = 2 [S45].
- **Sources:** S45 (Dynamo: sloppy quorum exists to avoid this), S52 (majority quorums).
