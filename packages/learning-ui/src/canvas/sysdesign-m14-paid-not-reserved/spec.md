# Canvas spec: sysdesign-m14-paid-not-reserved

- **Course and chapter:** system-design, 14.1 beat 1 (Paid, but never reserved).
- **Renderer:** `scene` (data only).
- **Claim:** Two writes to two systems are not one operation. A crash between them leaves the world half changed.
- **Story:** Layla taps Pay. Checkout asks Payments to charge 18 and Payments does. Checkout crashes before it tells Stock to reserve her items. Verdict: charged, but no stock reserved.
- **Numbers:** Course numbers only: 18 for the price. No dossier numbers.
- **Sources:** None needed for the story. The idea of a dual write is in S79.
