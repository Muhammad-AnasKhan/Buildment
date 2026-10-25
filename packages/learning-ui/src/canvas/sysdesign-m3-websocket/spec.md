# Canvas spec: sysdesign-m3-websocket

- **Course and chapter:** system-design, 3.5 beat 4.
- **Renderer:** `scene` (data only).
- **Claim:** A WebSocket starts as an HTTP request that asks to upgrade; after that one TCP connection carries messages in both directions, with no new request per message.
- **Story:** The phone sends `GET, Upgrade`; the server answers 101; "socket open" on both; then typing, "Omar: hi", "Lina: hello" and "Omar typing" cross in both directions. Verdict: "One connection, both directions".
- **Numbers:** None.
- **Sources:** [S104] RFC 6455 (WebSocket: two-way over TCP, designed to avoid multiple HTTP connections and long polling). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
