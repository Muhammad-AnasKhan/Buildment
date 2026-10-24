# Canvas spec: sysdesign-m13-cart-accepts

- **Course and chapter:** system-design, 13.1 beat 2 ("The cart that always says yes").
- **Renderer:** `scene` (data only).
- **Claim:** A store with no leader keeps accepting writes through a failure, and pays by holding versions that differ.
- **Story:** Hana adds milk through node A. Dina adds tea through node C. Node B is down and nobody waits for it. Both are told OK. A and C swap what they hold and see two different carts. Verdict: "Both adds saved; now two versions".
- **Numbers:** No numbers. Story only.
- **Sources:** S45 (Dynamo: any node takes a write; concurrent versions are kept).
