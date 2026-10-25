# Canvas spec: sysdesign-m14-outbox-twice

- **Course and chapter:** system-design, 14.4 beat 4 (The relay can repeat).
- **Renderer:** `scene` (data only).
- **Claim:** An outbox turns a lost event into a possible repeated event. Delivery is at least once, so the consumer must cope with copies.
- **Story:** Relay publishes e-7, crashes before marking. Restart: e-7 is still unsent, so it publishes again. The consumer receives e-7 twice.
- **Numbers:** No numbers.
- **Sources:** S79 for 'the relay may publish more than once'.
