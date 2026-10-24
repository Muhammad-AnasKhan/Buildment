# Canvas spec: sysdesign-m25-void-not-refund

- **Course and chapter:** system-design, 25.4 beat 6 ("The seat is gone: void, do not refund").
- **Renderer:** `scene` (data only).
- **Claim:** If the card is only authorized (money held, not taken) when the seat confirm fails, the fix is to void the authorization. The customer is never charged, so nothing needs refunding.
- **Story:** Tazkara authorizes 80 on Dina's card. The seat is gone. Tazkara voids. The hold on the card is released. Her bank app shows no charge. Verdict: "Void: nothing was ever charged".
- **Numbers:** 80 (course example).
- **Sources:** Authorize, capture and void are standard card-payment steps (source needed in the chapter). Saga compensation: chapter 14.3 [S78].
