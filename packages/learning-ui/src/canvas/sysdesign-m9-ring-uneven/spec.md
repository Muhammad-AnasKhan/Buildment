# Canvas spec: sysdesign-m9-ring-uneven

- **Course and chapter:** system-design, 9.3 beat 3 (One point per node gives slices of very different size).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** With one random point per node, slices are very uneven.
- **Story:** A at 10, B at 20, C at 70. A says 40% of keys, B 10%, C 50%. Verdict: One point each: C holds half the keys.
- **Numbers:** Slices 40, 10, 50 percent. For three random points the longest slice averages (1/3)(1 + 1/2 + 1/3) = 61% (a standard result, checked by simulation). Course test with 10 nodes and one point each: busiest node 2.6 times the average.
- **Sources:** [S45] (virtual nodes address this).
