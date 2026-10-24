# Canvas spec: sysdesign-m14-outbox-relay

- **Course and chapter:** system-design, 14.4 beat 3 (One commit, then publish).
- **Renderer:** `scene` (data only).
- **Claim:** If the event is saved in the same transaction as the order, a crash cannot separate them. Publishing becomes a separate job that can be retried.
- **Story:** App saves order and event in one commit. Relay asks for unsent rows, gets one, publishes it to the broker and marks it sent.
- **Numbers:** No numbers.
- **Sources:** S79 for the pattern.
