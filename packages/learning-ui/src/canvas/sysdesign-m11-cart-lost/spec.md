# Canvas spec: sysdesign-m11-cart-lost

- **Course and chapter:** system-design, 11.6 beat 5 ("Agreeing is not the same as being right").
- **Renderer:** `scene` (data only).
- **Claim:** Convergence means the copies end up equal, not that they end up correct. A merge rule that drops one side loses data silently.
- **Story:** Copy 1 holds a cart with a book (time 10). Copy 2 holds a cart with a pen (time 12). The rule keeps the later cart. Both copies now hold the pen. Verdict: "Copies agree, but the book is gone".
- **Numbers:** Course numbers (timestamps 10 and 12).
- **Sources:** Dynamo shopping cart merge; a merge that never loses an add and the resurfacing deleted items [S45]; Cassandra last-write-wins lost writes [S76]; CRDT convergence [S75].
