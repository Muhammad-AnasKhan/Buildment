# Canvas spec: sysdesign-m21-ranker-slow

- **Course and chapter:** system-design, 21.4 beat 6 (A slow ranker must not break the feed).
- **Renderer:** `scene` (data only).
- **Claim:** Ranking is an extra, not the product. A slow or failed ranker should cost relevance, not the feed.
- **Story:** The feed asks the ranker to score 500 candidates. After 50 ms it gives up and sends the 20 newest posts. Verdict: "Ranker slow: show time order".
- **Numbers:** Feed open budget 200 ms (p99, chapter 21.1). Ranker timeout 50 ms. Ranker today: 400 ms.
- **Sources:** Timeouts and graceful degradation: chapters 16.4 and 16.6. The times are course numbers.
