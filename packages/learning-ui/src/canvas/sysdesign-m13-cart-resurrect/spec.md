# Canvas spec: sysdesign-m13-cart-resurrect

- **Course and chapter:** system-design, 13.6 beat 2 ("A removed item comes back").
- **Renderer:** `scene` (data only).
- **Claim:** A union merge cannot tell an item that was removed from an item that the other side never saw removed.
- **Story:** Both nodes hold eggs and milk. Hana removes milk at A. Dina adds tea at B. The nodes swap carts and merge by union: eggs, milk and tea. Hana's removal is undone. Verdict: "The removed milk came back".
- **Numbers:** No numbers. Story only.
- **Sources:** S45 (Dynamo shopping cart: merging never loses an add, but deleted items can resurface).
