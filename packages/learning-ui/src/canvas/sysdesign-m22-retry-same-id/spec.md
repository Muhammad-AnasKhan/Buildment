# Canvas spec: sysdesign-m22-retry-same-id

- **Course and chapter:** system-design, 22.4 beat 3 ("A retry must not make a copy").
- **Renderer:** `scene` (data only).
- **Claim:** The phone cannot tell a lost request from a lost reply, so it retries. If the message carries an id the phone made, the service can recognise the retry and return the same number instead of saving a second copy.
- **Story:** Layla's phone sends a message with client id 7f3. The service saves it as number 41, but the reply is lost. After a 2 second wait the phone sends it again with the same id. The service finds 7f3 in its recent ids and answers "sent no. 41". The store still holds one copy. Verdict: "Same id, one copy".
- **Numbers:** Course numbers: 2 s wait, number 41, id 7f3.
- **Sources:** The idea is the idempotency key (chapter 6.4), with Stripe's description as the public reference [S80], and the dedupe table of chapter 14.5.
