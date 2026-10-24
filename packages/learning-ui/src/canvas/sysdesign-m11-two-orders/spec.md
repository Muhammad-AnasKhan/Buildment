# Canvas spec: sysdesign-m11-two-orders

- **Course and chapter:** system-design, 11.4 beat 2 ("Unrelated writes, two orders").
- **Renderer:** `scene` (data only).
- **Claim:** Writes that are not causally related can show up in different orders for different readers under causal consistency. Sequential consistency needs one order for everyone.
- **Story:** Ada's write 1 reaches C fast and D slowly. Bao's write 2 reaches D fast and C slowly. C ends up having seen 1 then 2, D having seen 2 then 1. Verdict: "Causal allows it, sequential does not".
- **Numbers:** Course numbers.
- **Sources:** Jepsen consistency map: causal consistency allows concurrent writes in different orders; sequential needs a total order [S46, S48, S49].
