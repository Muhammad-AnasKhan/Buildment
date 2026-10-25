# Canvas spec: sysdesign-m4-blast-radius

- **Course and chapter:** system-design, 4.2 beat 2 ("One failure: all or one eighth").
- **Renderer:** `scene` (data only).
- **Claim:** A failure takes out one machine, so the share of capacity lost is one machine's share: all of it with one server, one eighth with eight.
- **Story:** Two groups of students send 400 a second each, one to a big server, one to a group of eight small servers. The big server fails; one of the eight fails. Next requests: the big design's students get errors; the small design has 7 left (700 a second) and serves everyone. Verdict: "Same failure: 100% lost vs 12.5%".
- **Numbers:** 800 a second of capacity in both designs; 400 a second of demand; 1 of 8 is 12.5%.
- **Sources:** Story arithmetic. The trade-off framing follows the dossier (Scaling out). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
