# Canvas spec: sysdesign-m14-dual-write

- **Course and chapter:** system-design, 14.4 beat 1 (Save, then tell).
- **Renderer:** `scene` (data only).
- **Claim:** Writing to a database and a broker in two steps cannot be made atomic by ordering the steps.
- **Story:** Orders app saves order o-7. It crashes. The broker never gets OrderPlaced. Nothing will send it later. Verdict: order saved, event never sent.
- **Numbers:** No numbers.
- **Sources:** S79 (Richardson, transactional outbox) names the problem.
