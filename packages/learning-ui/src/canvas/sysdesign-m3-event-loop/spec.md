# Canvas spec: sysdesign-m3-event-loop

- **Course and chapter:** system-design, 3.6 beat 4.
- **Renderer:** `scene` (data only).
- **Claim:** An event loop runs on one thread: it starts each request's I/O and moves on, then finishes each request when its result arrives, so many waits are in progress at once without one thread per request.
- **Story:** Five requests arrive; the loop sends their queries (three drawn) and says "5 waits, free"; rows for 1 and 2 come back and replies go out. Verdict: "One thread, many waits at once".
- **Numbers:** None.
- **Sources:** No dossier source yet; chapter 3.6 marks `source needed` for the Node.js event loop documentation. Listed in the writer's reply.
