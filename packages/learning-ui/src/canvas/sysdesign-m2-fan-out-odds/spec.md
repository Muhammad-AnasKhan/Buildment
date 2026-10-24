# Canvas spec: sysdesign-m2-fan-out-odds

- **Course and chapter:** system-design, 2.4 beat 4.
- **Renderer:** `scene` (data only).
- **Claim:** Fan-out turns rare slowness into common slowness: 1 - 0.99^n.
- **Story:** The page waits for 1, 10, 50 and 100 calls; tags show 1%, 10%, 39% and 63% of pages slow. Verdict: "100 calls: 63% of pages slow".
- **Numbers:** 1 - 0.99^1 = 1%, ^10 = 9.6%, ^50 = 39.5%, ^100 = 63.4%.
- **Sources:** [S8] The Tail at Scale (100 servers, 1 in 100 slow, 63%). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
