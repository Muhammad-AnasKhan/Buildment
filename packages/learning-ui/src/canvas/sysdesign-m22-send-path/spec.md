# Canvas spec: sysdesign-m22-send-path

- **Course and chapter:** system-design, 22.2 beat 2 ("Sent means saved").
- **Renderer:** `scene` (data only).
- **Claim:** The chat service answers the sender only after the message has a number and is saved. So "sent" is a promise that the message will not be lost.
- **Story:** Layla's phone sends a message with a client id (7f3) through Gateway 1 to the chat service. The service gives it conversation number 41, saves it in the store, and only then sends "ok no. 41" back through the gateway. Layla sees one tick.
- **Numbers:** Course numbers: message number 41, client id 7f3.
- **Sources:** None needed. The save-before-ack rule is the design choice argued in the chapter.
