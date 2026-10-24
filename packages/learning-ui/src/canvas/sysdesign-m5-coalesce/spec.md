# Canvas spec: sysdesign-m5-coalesce

- **Course and chapter:** system-design, 5.6 beat 2 ("Coalescing: one query, many waiters").
- **Renderer:** `scene` (data only).
- **Claim:** Request coalescing lets only the first miss for a key query the database; every other request for that key waits for the same answer. Duplicate queries drop from "rate times rebuild time" to one.
- **Story:** The copy expires. The first request starts "the one query". More requests arrive; the app says "249 waiting" and the database "1 query". The answer comes back, is stored, and all 250 requests get the page. Verdict: "One query served 250 requests".
- **Numbers:** the same story numbers as the herd beat: 250 requests during a 50 ms rebuild.
- **Predict before it (in the chapter):** how many queries reach the database with coalescing on one app server.
- **Sources:** Facebook leases: a server hands out a lease token for a key at most once every 10 seconds, and other clients wait and retry; peak database queries fell from 17K/s to 1.3K/s in one test [S24].
