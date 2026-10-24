# Canvas spec: sysdesign-m9-ring-add-node

- **Course and chapter:** system-design, 9.3 beat 2 (A new node takes keys from one neighbour only).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** Adding a node moves only the keys between the new node and the node before it, and they all come from one neighbour.
- **Story:** Node D joins at 60 between B (36) and C (86). Key k2 (48) flies from C to D; k1 and k3 do not move. Verdict: Only keys between B and D move.
- **Numbers:** Made-up positions. Course test: 5th node added to 4, 100 points each, 19.4% of 100,000 keys moved (ideal 20%), none between old nodes.
- **Sources:** [S18], [S45].
