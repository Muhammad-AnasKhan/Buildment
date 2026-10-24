# Canvas spec: sysdesign-m3-polling

- **Course and chapter:** system-design, 3.5 beat 1.
- **Renderer:** `scene` (data only).
- **Claim:** With polling, the client asks on a timer, so most requests return nothing and a new message waits up to one poll interval before it is seen.
- **Story:** Polls at 0 s and 5 s return "nothing"; Omar writes at 6 s (tag); the 10 s poll returns the message (tag "seen 10 s"). Verdict: "3 requests, 1 message, 4 s late".
- **Numbers:** Made up for the picture: 5 s interval, one message at 6 s.
- **Sources:** [S106] RFC 6202 (polling, long polling and their known issues). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
