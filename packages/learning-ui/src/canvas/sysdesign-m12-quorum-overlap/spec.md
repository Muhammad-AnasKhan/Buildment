# Canvas spec: sysdesign-m12-quorum-overlap

- **Course and chapter:** system-design, 12.3 beat 1 (Two groups of two always meet).
- **Renderer:** `scene` (data only).
- **Claim:** When the write group and the read group are each more than half of the nodes, they must share at least one node, so a read sees the newest write.
- **Story:** Write v2 reaches R1 and R2 (2 of 3). A read asks R2 and R3, gets v2 and v1, and keeps v2. Verdict: "Read and write sets share a node".
- **Numbers:** N = 3, W = 2, R = 2, so W + R = 4 > 3 [S45, S52].
- **Sources:** S45, S52.
