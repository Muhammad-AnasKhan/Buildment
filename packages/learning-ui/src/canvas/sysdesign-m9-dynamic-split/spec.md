# Canvas spec: sysdesign-m9-dynamic-split

- **Course and chapter:** system-design, 9.5 beat 2 (Dynamic split: a full partition becomes two).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** A partition that reaches a size limit splits in two, and the new half can move to a node with room.
- **Story:** A partition grows to 10 GB (tags show the size and the limit), splits into two 5 GB halves; one stays on node 1, one moves to node 2. Verdict: A full partition splits in two.
- **Numbers:** Made-up limit of 10 GB.
- **Sources:** Source needed for any real system's split limit.
