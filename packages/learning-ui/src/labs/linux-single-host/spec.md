# linux-single-host

**Claim:** each part has a capacity from its size and count; the busiest part on the request path sets the ceiling, and p99 climbs once a part passes about 70% busy.

**Inputs:** offered load (500 to 12,000 req/s), and per part its size, count or replicas, and the course-specific settings in its panel.

**Rule:** the tiered-architecture model in `frontend/src/lab/tiered-architecture.ts`, the same engine every lab uses.

**Assumptions:** steady state, illustrative prices, links follow the request.

**Limits:** see the lab's limits line.

**Try this**

1. Raise the load until a part turns amber. Expected: that part sets the capacity ceiling.
2. Add replicas or turn on autoscaling for it. Expected: utilisation falls and p99 recovers.
3. Take a part down. Expected: without a second path the request path fails and the verdict names it.
