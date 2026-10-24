# Canvas spec: sysdesign-m10-vector-build

- **Course and chapter:** system-design, 10.4 beat 1 ("Each node keeps a counter for every node").
- **Renderer:** `scene` (data only).
- **Claim:** Vector clock rules: an event adds 1 to your own slot; a send attaches the vector; a receive takes the larger value in every slot, then adds 1 to your own slot.
- **Story:** A: [1,0,0], then [2,0,0] and a send. B receives: max gives [2,0,0], +1 gives [2,1,0]; B sends at [2,2,0]. C receives: [2,2,1]. Verdict: "Each slot counts one node's events".
- **Numbers:** Course numbers; the vectors are computed by the reference clock library of chapter 10.8.
- **Sources:** S45 (Dynamo uses vector clocks), S52 (Kleppmann notes).
