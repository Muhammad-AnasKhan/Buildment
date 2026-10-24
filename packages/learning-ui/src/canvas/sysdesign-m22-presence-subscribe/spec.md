# Canvas spec: sysdesign-m22-presence-subscribe

- **Course and chapter:** system-design, 22.4 beat 8 ("Tell only people who are looking").
- **Renderer:** `scene` (data only).
- **Claim:** Pushing every status change to every contact multiplies traffic by the contact count. Watching on demand keeps it to the few people who have that person's chat open.
- **Story:** Layla opens Sami's chat; the presence store records one watcher. Sami's app opens and reports online. The store tells Layla only. Dana, who has Sami in her contacts but is not looking, is told nothing. Layla leaves the chat and the watcher count returns to zero. Verdict: "Tell only people who are looking".
- **Numbers:** None.
- **Sources:** None needed (course design).
