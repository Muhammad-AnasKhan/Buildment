# Canvas spec: sysdesign-m22-route-lookup

- **Course and chapter:** system-design, 22.3 beat 2 ("Find the gateway, or keep the message").
- **Renderer:** `scene` (data only).
- **Claim:** Routing a message is a lookup: user to gateway. A found entry means deliver through that gateway. A missing entry means the user is offline, so the service keeps the message and sends a push alert.
- **Story:** For Sami, the chat service asks the registry, gets "Gateway 2", sends the message there, and Sami gets it. For Dana, the registry has no entry, so the service keeps the message and sends a push alert. Verdict: "Found: deliver. Missing: keep it".
- **Numbers:** None. Names are made up.
- **Sources:** None needed (course design).
