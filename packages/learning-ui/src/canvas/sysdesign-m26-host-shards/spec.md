# Canvas spec: sysdesign-m26-host-shards

- **Course and chapter:** system-design, 26.2 beat 5 (One worker owns each host).
- **Renderer:** `scene` (data only). Export: `sysdesignM26HostShards`.
- **Claim:** Partition the frontier by host, not by URL, so one worker sees every request to a host and politeness needs no coordination.
- **Story:** The parser sends shop/p9 and shop/p2 to worker 2 and news/p4 to worker 1. Worker 2 holds both shop links in one queue. Verdict: "One owner per host: easy politeness".
- **Numbers:** None.
- **Sources:** Chapter 9.3 (consistent hashing) and 15.4 (partition key keeps order per key).
