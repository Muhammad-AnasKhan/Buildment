# Canvas spec: sysdesign-m9-fixed-partitions

- **Course and chapter:** system-design, 9.5 beat 1 (Fixed partitions: a new node takes whole pieces).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** With a fixed number of partitions, a new node takes whole partitions, so only about 1/(N+1) of the data moves.
- **Story:** Four nodes with 16 partitions each. Node 5 joins empty and takes 3, 3, 3 and 4 partitions. Ends 13, 13, 13, 12, 13. Verdict: 13 of 64 partitions move.
- **Numbers:** 64 / 5 = 12.8, so one node has 12 and four have 13; 13 of 64 = 20% of the data, about 370 GB of 1.8 TB.
- **Sources:** Source needed: which real systems use fixed partition counts is not in the dossier.
