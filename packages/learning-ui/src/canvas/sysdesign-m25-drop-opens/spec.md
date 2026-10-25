# Canvas spec: sysdesign-m25-drop-opens

- **Course and chapter:** system-design, 25.1 beat 1 ("Ten o'clock: 400,000 fans, 20,000 seats").
- **Renderer:** `scene` (data only).
- **Claim:** On a ticket drop, many requests aim at the same seat and only one can win, so most hold requests must be refused, and refused fast.
- **Story:** Fans send 80,000 requests a second to Tazkara. Ten want seat 7. The seat store accepts one hold and refuses nine. The nine are told "taken". Verdict: "Most holds must fail. Make them cheap".
- **Numbers:** 400,000 fans, 20,000 seats, 80,000 requests a second at peak (chapter 25.1 estimate). Ten fans on one seat is an illustration.
- **Sources:** Course assumptions and arithmetic on them (method from chapter 2.3). Tazkara is fictional.
