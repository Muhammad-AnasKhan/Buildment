# Canvas spec: sysdesign-m19-dns-timeline

- **Course and chapter:** system-design, 19.5 beat 1 ("Dark until the cache expires").
- **Renderer:** `scene` (data only), with a seconds strip from 0 to 240.
- **Claim:** A DNS failover moves users only after the health check decides (interval x failures) and then after every cached copy of the old answer expires (the TTL). The two add up.
- **Story:** Region A fails at 0. Tags: "A fails" at 0, "3rd check fails" at 90, "Cache expires" at 150. The customer is dark until the tag at 150, then reaches Region B. Verdict: "Dark for 90 s check + 60 s cache".
- **Numbers:** Route 53 health checks run every 10 or 30 seconds; the failure threshold of 3 is a course choice. 30 s x 3 = 90 s. TTL 60 s (the course's choice; ELB uses 60 s for its records [S15]). Worst case 90 + 60 = 150 s.
- **Sources:** Amazon Route 53 documentation, how Route 53 determines health (intervals of 10 or 30 seconds; not yet in the dossier); [S111]; [S15]; 3.3 for the TTL floor.
