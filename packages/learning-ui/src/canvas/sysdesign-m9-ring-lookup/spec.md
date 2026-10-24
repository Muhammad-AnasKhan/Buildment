# Canvas spec: sysdesign-m9-ring-lookup

- **Course and chapter:** system-design, 9.3 beat 1 (A key goes to the next node on the ring).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** On a hash ring, a key belongs to the first node at or after its position, wrapping round.
- **Story:** Nodes A 10, B 36, C 86 appear as tags on the position strip. Keys k1 (24), k2 (60), k3 (94) appear; each owner says it owns the key. k3 wraps round to A. Verdict: Each key goes to the next node.
- **Numbers:** Made-up positions on a 0 to 100 ring.
- **Sources:** [S18] Karger et al. 1997 (consistent hashing); [S45] Dynamo.
