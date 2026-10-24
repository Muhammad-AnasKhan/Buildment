# Canvas spec: sysdesign-m22-half-open

- **Course and chapter:** system-design, 22.3 beat 5 ("A dead line can look open").
- **Renderer:** `scene` (data only).
- **Claim:** When a phone vanishes without closing its connection, the gateway keeps the line and the registry entry. A gateway write is not proof of delivery. Only a reply (an ack, or a pong to a ping) proves the phone is there.
- **Story:** Sami's phone loses signal. The chat service sends message 42 to the gateway, which writes it to the line. The gateway pings, waits, hears nothing for 10 seconds, and marks the line dead. It tells the chat service that message 42 was not delivered, so the service keeps it and sends a push alert. Verdict: "No pong means the line is dead".
- **Numbers:** Course numbers: 10 s wait for a pong.
- **Sources:** {/* source needed: RFC 9293 on half-open TCP connections, and RFC 6455 on WebSocket ping and pong frames; the course states both as general network behaviour */}
