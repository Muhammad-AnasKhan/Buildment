# Canvas spec: sysdesign-m10-vector-concurrent

- **Course and chapter:** system-design, 10.4 beat 4 ("Neither vector is bigger").
- **Renderer:** `scene` (data only).
- **Claim:** If neither vector is at most the other in every slot, the two events are concurrent: no chain of messages links them.
- **Story:** A adds milk ([1,0,0]) and C adds tea ([0,0,1]) with no message between them. B receives both and holds 2 versions. Verdict: "Concurrent: keep both versions".
- **Numbers:** Course numbers. The cart is a made-up example in the style of the Dynamo paper's cart.
- **Sources:** S45 (Dynamo: vector clocks detect divergent versions, reconciled on read).
