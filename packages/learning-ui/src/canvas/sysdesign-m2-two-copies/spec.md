# Canvas spec: sysdesign-m2-two-copies

- **Course and chapter:** system-design, 2.6 beat 4.
- **Renderer:** `scene` (data only).
- **Claim:** Redundant copies behind a health-checking load balancer survive one failure.
- **Story:** App A fails its health check and the load balancer sends the next page to App B; the user still gets the page. Verdict: "One copy down: still serving".
- **Numbers:** Two copies at 99.9% each: 1 - 0.001^2 = 99.9999% if independent.
- **Sources:** Parallel formula is probability arithmetic under independent failures (source needed for a citable reference). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
