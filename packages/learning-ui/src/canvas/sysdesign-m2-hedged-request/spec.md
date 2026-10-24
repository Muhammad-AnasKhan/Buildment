# Canvas spec: sysdesign-m2-hedged-request

- **Course and chapter:** system-design, 2.4 beat 5.
- **Renderer:** `scene` (data only).
- **Claim:** A hedged request sends a second copy after a short wait and takes the first answer.
- **Story:** Replica A is stuck; after a short wait the page asks Replica B, which answers fast; A's request is cancelled. Verdict: "Second copy beat the slow one".
- **Numbers:** The 20 ms wait is illustrative.
- **Sources:** [S8] The Tail at Scale (hedged requests). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
