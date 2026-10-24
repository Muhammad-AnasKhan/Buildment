# Canvas spec: sysdesign-m2-cache-vs-memory

- **Course and chapter:** system-design, 2.2 beat 1.
- **Renderer:** `scene` (data only).
- **Claim:** Scaled to human time (1 ns = 1 s), a main memory read is 100 times an L1 cache hit.
- **Story:** The CPU reads a from L1 (1 human second), then b from memory while a ring counts to 100 seconds. Verdict: "Memory is 100 times slower".
- **Numbers:** L1 about 1 ns (modelled), main memory 100 ns.
- **Sources:** [S2] Colin Scott interactive latency model; classic values [S1]. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
