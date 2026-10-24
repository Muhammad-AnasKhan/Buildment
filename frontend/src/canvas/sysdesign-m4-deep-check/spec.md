# Canvas spec: sysdesign-m4-deep-check

- **Course and chapter:** system-design, 4.4 beat 5 ("Deep checks can fail every server").
- **Renderer:** `scene` (data only).
- **Claim:** A health check that tests a shared dependency turns that dependency's trouble into every server failing at once; local checks and failing open avoid removing the whole fleet.
- **Story:** The balancer asks both apps "health?"; each pings the database and answers healthy. The database becomes slow. The next checks time out on both apps at once; the balancer has 0 healthy servers and fails open, sending traffic to all of them. Verdict: "One slow database failed every server".
- **Numbers:** None.
- **Sources:** Liveness, local and dependency health checks; dependency checks can fail a whole fleet; load balancers that fail open send traffic to all targets when all fail [S19]. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
