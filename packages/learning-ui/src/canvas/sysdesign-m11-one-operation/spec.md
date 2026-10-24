# Canvas spec: sysdesign-m11-one-operation

- **Course and chapter:** system-design, 11.2 beat 2 ("Start, end, and one instant inside").
- **Renderer:** `scene` (data only).
- **Claim:** Every operation has a start, an end and a result, and its effect happens at one instant somewhere between the start and the end.
- **Story:** Ada's write starts at 10, reaches the store, is applied, and she is told ok at 40. A tag marks the instant the effect lands (27) between the start and the end. Verdict: "It takes effect between 10 and 40".
- **Numbers:** Course numbers (10, 27, 40 ms).
- **Sources:** Herlihy and Wing 1990 for operations with an invocation and a response [S47].
