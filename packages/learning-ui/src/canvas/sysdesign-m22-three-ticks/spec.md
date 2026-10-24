# Canvas spec: sysdesign-m22-three-ticks

- **Course and chapter:** system-design, 22.4 beat 4 ("Three ticks, three facts").
- **Renderer:** `scene` (data only).
- **Claim:** A delivery receipt is not one thing. "Sent" is the server saying it saved the message. "Delivered" is the recipient's phone saying it received it. "Read" is the phone saying the person opened the chat. Each is reported by a different step and travels back as its own small message.
- **Story:** Layla sends. The server saves and replies "saved": one tick. The server passes the message to Sami's phone, which replies "received": two ticks. Sami opens the chat, the phone sends "read", and Layla sees blue ticks. Verdict: "Each tick is a separate fact".
- **Numbers:** None.
- **Sources:** None needed (course design).
