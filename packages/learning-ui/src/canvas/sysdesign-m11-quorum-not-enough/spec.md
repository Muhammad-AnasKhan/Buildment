# Canvas spec: sysdesign-m11-quorum-not-enough

- **Course and chapter:** system-design, 11.3 beat 5 ("Overlapping reads and writes are not enough").
- **Renderer:** `scene` (data only).
- **Claim:** Plain quorum reads and writes with R + W over N are not linearizable by themselves: a write in progress can be seen by one read and missed by a later one.
- **Story:** A writer sends x = 1 to three nodes. It reaches node 1 quickly and the others slowly. Reader A asks nodes 1 and 2, sees 1 and 0, and returns 1. Reader B asks nodes 2 and 3 after A is done, sees 0 and 0, and returns 0. Verdict: "A saw 1, then B saw 0".
- **Numbers:** N = 3, W = 2, R = 2 (a common choice, 3-2-2 in Dynamo [S45]).
- **Sources:** Kleppmann Cambridge notes on quorums and the ABD algorithm [S52]; Dynamo (N, R, W) = (3, 2, 2) [S45].
