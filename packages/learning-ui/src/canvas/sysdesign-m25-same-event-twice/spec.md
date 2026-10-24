# Canvas spec: sysdesign-m25-same-event-twice

- **Course and chapter:** system-design, 25.3 beat 5 ("The same event twice posts once").
- **Renderer:** `scene` (data only).
- **Claim:** A ledger post keyed by the event or payment id is idempotent: the second copy is recognised and changes nothing. The unique key must live in the same database as the entries, so both change in one transaction.
- **Story:** The provider sends "paid pay_91", gets no reply in time and sends it again. The worker posts both. The ledger holds one posting; the second is "already posted". Verdict: "The second copy changes nothing".
- **Numbers:** None. Made-up id pay_91.
- **Sources:** Idempotency keys [S80]; at-least-once delivery and idempotent consumers [S82, S83]; chapters 6.4 and 14.5.
