# Canvas spec: sysdesign-m11-one-at-a-time

- **Course and chapter:** system-design, 11.2 beat 4 ("Pretend it ran one at a time").
- **Renderer:** `scene` (data only).
- **Claim:** In a legal one-at-a-time order, a read returns the value of the last write placed before it in that order.
- **Story:** Ada writes 5, the store holds 5, Ben reads and gets 5. Ada writes 7, Ben reads and gets 7. Verdict: "A read sees the last write".
- **Numbers:** Course numbers.
- **Sources:** Lamport 1979 and Herlihy and Wing 1990 for a sequential specification of a register [S47, S48].
