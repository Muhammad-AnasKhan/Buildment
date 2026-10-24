# Canvas spec: sysdesign-m2-bursts-wait

- **Course and chapter:** system-design, 2.5 beat 2.
- **Renderer:** `scene` (data only).
- **Claim:** Random bursts make requests wait even when the server is idle half the time.
- **Story:** Three requests arrive at once; the server takes them one per second, then sits idle. Verdict: "Half idle, yet two had to wait".
- **Numbers:** 3 seconds of work in a 6 second window: 50% busy.
- **Sources:** Story arithmetic; M/M/1 assumptions [S6, S7]. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
