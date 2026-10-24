# Canvas spec: sysdesign-m4-round-robin-blind

- **Course and chapter:** system-design, 4.5 beat 1 ("Round robin ignores how busy servers are").
- **Renderer:** `scene` (data only).
- **Claim:** Round robin spreads requests evenly by count, not by work, so uneven requests make uneven load.
- **Story:** The balancer sends an export to A (busy 2 s), pages to B and C (done at once). The next export goes to A again (1 waiting), pages to B and C. The third export goes to A (2 waiting); B and C are idle. Verdict: "Round robin kept feeding busy A".
- **Numbers:** Exports take about 2 s; pages about 10 ms. Made-up round numbers.
- **Sources:** Round robin and weighted round robin in Envoy [S16]; ALB uses round robin by default [S15]. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
