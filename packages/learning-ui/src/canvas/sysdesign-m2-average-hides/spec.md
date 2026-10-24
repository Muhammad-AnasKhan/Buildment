# Canvas spec: sysdesign-m2-average-hides

- **Course and chapter:** system-design, 2.4 beat 1.
- **Renderer:** `scene` (data only).
- **Claim:** The mean of a skewed set is a value no request had; percentiles describe what users felt.
- **Story:** Nine requests return in 8 to 15 ms and one in 1,000 ms; tags show p50 11 ms, slowest 1,000 ms and the average 110 ms. Verdict: "Average 110 ms: nobody waited that".
- **Numbers:** Values 8, 9, 10, 10, 11, 12, 12, 14, 15, 1000: sum 1,101, mean 110.1, nearest-rank p50 11.
- **Sources:** [S95] SRE book: prefer percentiles to means. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
