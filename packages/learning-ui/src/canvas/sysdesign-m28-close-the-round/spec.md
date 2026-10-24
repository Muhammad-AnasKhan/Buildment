# Canvas spec: sysdesign-m28-close-the-round

- **Course and chapter:** system-design, 28.2 beat 6 ("Close with one cost and one failure").
- **Renderer:** `scene` (data only).
- **Claim:** The last minutes of a round earn the score for judgment: one choice said as choice, what it buys, what it costs and when you would switch, then one failure and its fix.
- **Story:** The candidate sends four messages: choice (a 302), buys (every click), costs (a hop more) and switch (no counting). The interviewer asks "what breaks?". The candidate names a cache restart and sends "spread the cache". Verdict: "Choice, cost, switch, failure".
- **Numbers:** None on screen. The 302 and the cache failure are from chapter 20.4.
- **Sources:** Chapter 20.4; the trade-off shape from the authoring standards (choice, why now, buys, costs, alternative, when to switch).
