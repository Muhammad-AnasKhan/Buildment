# Canvas spec: sysdesign-m2-utilisation-knee

- **Course and chapter:** system-design, 2.5 beat 3.
- **Renderer:** `scene` (data only).
- **Claim:** Waiting time grows non-linearly as utilisation nears 100% (the knee).
- **Story:** Arrivals step from 50 to 90 to 99 per second against a 10 ms server; tags show mean time in system 10, 20, 100 and 1,000 ms. Verdict: "At 99% busy: 100x the service time".
- **Numbers:** M/M/1 W = 1 / (mu - lambda) with mu = 100/s: 20 ms at 50/s, 100 ms at 90/s, 1 s at 99/s.
- **Sources:** [S6] MIT OCW M/M/1 notes; [S7] Brooker, Latency Sneaks Up On You. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
