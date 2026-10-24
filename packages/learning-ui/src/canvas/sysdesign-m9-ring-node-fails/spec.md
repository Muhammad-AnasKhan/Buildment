# Canvas spec: sysdesign-m9-ring-node-fails

- **Course and chapter:** system-design, 9.3 beat 5 (When a node fails, who takes its keys?).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** With virtual nodes a failed node's keys are shared by all survivors instead of falling on one neighbour.
- **Story:** Four nodes at 25% each. Node D fails with one point: A takes all and rises to 50%. Then D with 100 points fails: A, B and C each rise to 33%. Verdicts: One point: one node takes it all, then 100 points: the load is shared.
- **Numbers:** 25% + 25% = 50%; 25% + 25%/3 = 33%.
- **Sources:** Source needed: the Dynamo paper's statement about load dispersal when a node fails is not in the dossier (only the virtual node idea is, [S45]).
