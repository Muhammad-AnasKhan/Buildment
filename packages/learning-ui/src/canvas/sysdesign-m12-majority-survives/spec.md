# Canvas spec: sysdesign-m12-majority-survives

- **Course and chapter:** system-design, 12.3 beat 3 (Five nodes, two can fail).
- **Renderer:** `scene` (data only).
- **Claim:** A cluster of 2f + 1 nodes works while f are down, because the survivors are still a majority. One more failure and it must stop.
- **Story:** N4 and N5 are down; N1 writes to N2 and N3 and has 3 of 5, a majority. Then N3 fails; N1 writes to N2 and has 2 of 5, which is not a majority, so the write cannot count.
- **Numbers:** N = 5, majority 3, tolerates 2 failures: floor(5 / 2) + 1 = 3 and 5 - 3 = 2 [S52].
- **Sources:** S52 (Kleppmann on majority quorums).
