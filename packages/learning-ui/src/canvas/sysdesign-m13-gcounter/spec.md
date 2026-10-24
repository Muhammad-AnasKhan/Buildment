# Canvas spec: sysdesign-m13-gcounter

- **Course and chapter:** system-design, 13.7 beat 2 ("Each replica counts its own slot").
- **Renderer:** `scene` (data only).
- **Claim:** A G-Counter merge (slot-wise max) is commutative, associative and idempotent, so every replica ends with the same total in any order.
- **Story:** A counts 2 in its slot. B counts 3 in its slot. They swap and each shows A:2 B:3, a total of 5. A late copy of A's old slot arrives and changes nothing. Verdict: "Same total, 5, in any order".
- **Numbers:** 2 + 3 = 5.
- **Sources:** S74 (G-Counter: per-replica increment vector, merge by max).
