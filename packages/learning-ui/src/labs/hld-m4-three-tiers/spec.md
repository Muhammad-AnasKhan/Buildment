# Three tiers at 10,000 requests a second

**Claim:** the busiest part on the request path sets the ceiling, and the load balancer and the database are parts too. Sizing only the app tier leaves Daftar stuck near 1,600 requests a second, and a design that lives in one zone fails the availability target however big it is.

**Inputs:** offered load, and per part its size, count, zones, read replicas and the database standby.

**Rule:** the tiered-architecture model in `frontend/src/lab/tiered-architecture.ts`. A part's capacity comes from its size tier (vCPUs times a per-role rate) and its count or zones. Utilisation is the load it sees over its capacity, and p99 climbs past about 70% busy (module 2's knee). A part in one zone fails with that zone; two zones or a standby keep it up.

**Assumptions:** steady state, illustrative prices, 80% of database traffic is reads, links follow the request.

**Limits:** a model, not a cloud. It compares the shapes of designs, not a real bill or real milliseconds.

**Checked against the model (level 1, 10,000 req/s):**

| Design | Ceiling | p99 | Availability | Cost |
|---|---|---|---|---|
| Starting board | 1,600 | 2,010 ms | 99.69% | $0.64/h |
| Large balancer in 2 zones, 8 app servers in 2 zones, large database with 1 replica and a standby | 12,000 | 109 ms | above 99.99% | $3.56/h |
| Same, without the database standby | 12,000 | 109 ms | 99.85% | $2.96/h |

Level 2 (20,000 req/s) passes with an extra-large balancer, 14 app servers and an extra-large database with 2 replicas: p99 87 ms at $8.08/h. Levels 2 and 3 are not yet played by the board, which scores level 1.

**Try this**

1. Add app servers only. Expected: the ceiling does not move, because the load balancer is the busiest part.
2. Size up the balancer, then watch the database turn amber. Expected: a read replica or a bigger size brings p99 back under 200 ms.
3. Turn off the database standby. Expected: availability drops below 99.9% while cost falls by $0.60 an hour.
