# Canvas spec: sysdesign-m4-n-plus-one

- **Course and chapter:** system-design, 4.2 beat 3 ("Plan for one server down").
- **Renderer:** `scene` (data only).
- **Claim:** Count capacity with one server already gone (N+1): the fleet must carry peak load on N servers after losing one.
- **Story:** Students send 400 a second; the balancer gives each of 5 servers 80 a second (80% busy). One server fails; the balancer has 4. The next 400 a second become 100 each: the servers are full and the line grows. The balancer's line changes to "plan: 6" and the servers' to "5 left at 80%". Verdict: "Need N+1: 6 servers, not 5".
- **Numbers:** 400 requests a second (8,000 students x 0.05); 100 a second per server; 400 / 5 = 80; 400 / 4 = 100; 400 / 5 = 80 after losing one of six.
- **Sources:** Story arithmetic; queueing near 100% from chapter 2.5 [S6, S7]. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
