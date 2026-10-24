# Canvas spec: sysdesign-m3-sse

- **Course and chapter:** system-design, 3.5 beat 3.
- **Renderer:** `scene` (data only).
- **Claim:** Server-sent events keep one response open as a stream from server to client; the browser reconnects by itself and sends `Last-Event-ID` so the server can resume.
- **Story:** The phone opens `GET /events`; msg 1 and msg 2 arrive; the signal is lost; the phone reconnects with `Last-Event-ID: 2`; the server resumes with msg 3. Verdict: "Reconnected, resumed after msg 2".
- **Numbers:** None.
- **Sources:** [S105] WHATWG HTML, server-sent events (`EventSource`, automatic reconnection, `Last-Event-ID`, HTTP 204 stops reconnection). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
