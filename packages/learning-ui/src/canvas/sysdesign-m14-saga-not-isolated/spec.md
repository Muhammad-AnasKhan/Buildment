# Canvas spec: sysdesign-m14-saga-not-isolated

- **Course and chapter:** system-design, 14.3 beat 5 (Others see the middle).
- **Renderer:** `scene` (data only).
- **Claim:** A saga has no isolation. Each step is visible as soon as it commits, even if a later step makes the saga undo it.
- **Story:** Saga reserves the last bag. Omar asks to buy and is told sold out. The card is declined, the saga releases the bag. Omar was told a sold-out lie.
- **Numbers:** Course numbers: one bag left.
- **Sources:** Richardson, microservices.io: sagas lack isolation (to be added to the dossier).
