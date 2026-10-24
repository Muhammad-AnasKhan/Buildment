# Canvas spec: sysdesign-m8-read-repair

- **Course and chapter:** system-design, 8.7 beat 3 ("A read can repair a stale copy").
- **Renderer:** `scene` (data only).
- **Claim:** In leaderless stores, a read can both answer and heal a stale copy.
- **Story:** The client reads from three nodes. Nodes 1 and 2 return x = 7 (version 2), node 3 returns x = 6 (version 1). The client keeps version 2 and writes it to node 3. Verdict: "Stale copy fixed by the read".
- **Numbers:** versions 1 and 2 are illustrative.
- **Sources:** Dynamo: read repair and vector clocks [S45].
