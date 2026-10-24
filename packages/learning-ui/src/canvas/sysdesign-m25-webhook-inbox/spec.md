# Canvas spec: sysdesign-m25-webhook-inbox

- **Course and chapter:** system-design, 25.4 beat 2 ("Save the webhook, reply, work later").
- **Renderer:** `scene` (data only).
- **Claim:** A webhook endpoint should verify the sender, save the raw event durably, and reply with success before doing the real work. A worker reads the saved event later. This keeps the reply fast and makes a retried delivery harmless.
- **Story:** The provider sends evt_1. The endpoint verifies the sender, saves the raw event in the inbox, replies 200 OK. A worker takes evt_1 from the inbox and posts it to the ledger. Verdict: "Save first, reply 200, work later".
- **Numbers:** None.
- **Sources:** Course design. The inbox idea: chapter 14.5 and the outbox pattern [S79]. Webhook retry behaviour differs by provider (source needed in the chapter).
