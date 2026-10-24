# Canvas spec: sysdesign-m3-long-polling

- **Course and chapter:** system-design, 3.5 beat 2.
- **Renderer:** `scene` (data only).
- **Claim:** With long polling, the server holds the request until there is news, so a message is delivered as soon as it exists, at the cost of one open request per waiting client.
- **Story:** The phone asks at 0 s; the server holds (a ring counts to 6 s); Omar writes at 6 s and the server answers at once (tags "sent 6 s", "seen 6 s"); the phone asks again and the server holds again. Verdict: "Held open, answered at once".
- **Numbers:** Made up for the picture.
- **Sources:** [S106] RFC 6202 (long polling and its known issues). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
