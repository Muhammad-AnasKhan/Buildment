# Canvas spec: sysdesign-m12-two-readers

- **Course and chapter:** system-design, 12.3 beat 4 (A half-finished write).
- **Renderer:** `scene` (data only).
- **Claim:** Overlapping quorums are not enough when a write is only half done: depending on which nodes a read asks, it can see the new value or the old one.
- **Story:** The writer sends v2 and crashes after R1 stores it. Reader A asks R1 and R2 and keeps v2. Reader B asks R2 and R3 and sees only v1.
- **Numbers:** N = 3, the write reached 1 node (W would need to be 2).
- **Sources:** S52 (quorum reads are not linearizable by themselves; the ABD algorithm adds read repair).
