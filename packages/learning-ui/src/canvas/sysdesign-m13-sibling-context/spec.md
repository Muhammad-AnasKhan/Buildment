# Canvas spec: sysdesign-m13-sibling-context

- **Course and chapter:** system-design, 13.6 beat 1 ("Write back with the context").
- **Renderer:** `scene` (data only).
- **Claim:** The context from a read tells the store which versions a write has seen, so it can replace them.
- **Story:** The store returns 2 versions with a context. The app merges them and writes without the context. The store now holds 3. The app reads again and writes with the context. The store holds 1. Verdict: "Context lets a write replace siblings".
- **Numbers:** Versions 2, then 3, then 1. Vector clocks as in chapter 10.4.
- **Sources:** S45 (Dynamo: the context carries the vector clock information; reconciliation on read).
