# Canvas spec: sysdesign-m4-two-choices

- **Course and chapter:** system-design, 4.5 beat 3 ("Two random choices, nearly as good").
- **Renderer:** `scene` (data only).
- **Claim:** Comparing just two random servers avoids the busiest ones almost as well as checking them all, at the cost of two lookups.
- **Story:** Counts are A 5, B 1, C 4, D 2. The first roll picks A and D; D has fewer, so D gets the page (now 3). A finishes one (now 4). The second roll picks B and C; B has fewer and gets the page (now 2). C finishes one. Verdict: "Two random picks, the less busy wins".
- **Numbers:** Requests in flight 5, 1, 4 and 2 to start.
- **Sources:** Least request with 2 random choices by default, "nearly as good as an O(N) full scan" [S16]; two choices gives an exponential improvement over one, three only a constant factor more [S17]. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
