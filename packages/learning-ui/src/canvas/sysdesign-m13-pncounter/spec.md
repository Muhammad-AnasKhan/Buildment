# Canvas spec: sysdesign-m13-pncounter

- **Course and chapter:** system-design, 13.7 beat 3 ("Two G-Counters make a counter that goes down").
- **Renderer:** `scene` (data only).
- **Claim:** A PN-Counter keeps increments and decrements in two grow-only counters and subtracts them, so it can go down and still merge in any order.
- **Story:** A holds up 3, down 0. B holds up 0, down 1. They swap and merge each half. Both show up 3, down 1, so the value is 3 - 1 = 2. Verdict: "Value is 3 - 1 = 2 on both".
- **Numbers:** 3 - 1 = 2.
- **Sources:** S74 (PN-Counter: two vectors, P and N).
