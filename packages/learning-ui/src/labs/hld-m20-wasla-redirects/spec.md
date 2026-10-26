# Wasla's redirects with cache-aside

**Claim:** at 100,000 redirects a second, no database size alone keeps up; a cache in front of it does, but the misses still reach the database and the cache itself needs enough nodes.

**Inputs:** offered load, and per part its size and count, the cache's hit rate and nodes, and the database's size and read replicas.

**Rule:** the tiered-architecture model in `frontend/src/lab/tiered-architecture.ts`. A database linked beside a cache only sees the cache misses (load times one minus the hit rate). Each part's capacity comes from its size tier and count, and p99 climbs past about 70% busy.

**Assumptions:** steady state, the cache is warm, 99% of database traffic is reads, illustrative prices.

**Limits:** a model, not a cloud. Its milliseconds are model units, not the 0.55 ms hit and 3.05 ms miss of chapter 20.4.

**Checked against the model (level 1, 100,000 req/s):**

| Design | Ceiling | p99 | Cost |
|---|---|---|---|
| Starting board (no cache) | 2,424 | 678 ms | $13.80/h |
| Cache, 4 nodes, 95% hits, database as given | 48,485 | 678 ms | $14.40/h |
| Cache, 4 nodes, 95% hits, database with 2 read replicas | 115,200 | 171 ms | $15.00/h |
| Cache, 4 nodes, 95% hits, large database with 1 replica | 115,200 | 162 ms | $15.60/h |

Level 1 needs a cache and a database sized for the misses. Levels 2 and 3 are not yet played by the board, which scores level 1.

**Try this**

1. Add a cache at 80% hits. Expected: the database still sees 20,000 reads a second and stays the busiest part.
2. Raise the hit rate to 95%. Expected: the ceiling rises, but 5,000 misses a second still overload a single database.
3. Add read replicas. Expected: p99 drops under 200 ms and the design costs about $15 an hour.
