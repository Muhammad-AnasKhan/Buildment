# Canvas spec: sysdesign-m7-store-keyed

- **Course and chapter:** system-design, 7.2 beat 3.
- **Renderer:** `scene` (data only).
- **Claim:** A key-value store answers one question well: give me the value for this key. Any other question is a scan unless the store has an index for it.
- **Story:** The app gets order:8841 and receives the whole order in one read. Then it asks for the orders of event 7. The store has no way to find them except by scanning all keys.
- **Numbers:** No timing numbers. The point is the number of keys looked at: 1 against all of them.
- **Predict before it (in the chapter):** 7.2, right before this beat: Ticketline moves orders into a key-value store keyed by order id and marketing asks for every order of event 7. Fast, or a read of every order? (Answer: it must read every order.)
- **Sources:** Course example. DynamoDB item access by primary key [S40]; MongoDB data modeling: data accessed together is stored together (MongoDB manual, read 2026-10-24).
