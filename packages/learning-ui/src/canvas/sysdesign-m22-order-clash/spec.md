# Canvas spec: sysdesign-m22-order-clash

- **Course and chapter:** system-design, 22.4 beat 1 ("Arrival order differs per phone").
- **Renderer:** `scene` (data only).
- **Claim:** If each phone shows messages in the order they arrive, two people writing at the same moment can see different chats, because the copies take paths of different speed.
- **Story:** Dana says "yes" and Omar says "no" a moment later. The chat service passes both on to Layla and Sami. Dana's message reaches Layla fast and reaches Sami slowly (2 seconds in the picture). Omar's reaches both fast. Layla sees "yes, then no". Sami sees "no, then yes". Verdict: "Two phones, two different orders".
- **Numbers:** Course numbers only: a slow path is drawn as a longer flight.
- **Sources:** None needed. The clock-based version of this problem is chapter 10.1; this picture uses arrival order.
