# Design a URL shortener (visual challenge)

**Claim:** a short-link service that only shortens and redirects is easy to build and easy to break. To pass, the design must also count clicks without slowing a redirect, and keep answering when an app server, the cache or the click worker dies. Each of those needs a part, and each part costs money, so the lab asks for the cheapest design that survives.

**Inputs:** the parts the learner places (client, load balancer, app server, cache, database, queue, worker), the links between them, and per part its size, count, zones, and for the cache its hit rate, for the database its read replicas, standby and read share, and for the worker its batch size. The offered load is fixed by the brief at 3,000 redirects a second.

**Rule:** the tiered-architecture model in `frontend/src/lab/tiered-architecture.ts`, played through four scenarios by `frontend/src/lab/challenge.ts`:

1. Peak traffic: everything healthy at 3,000 redirects a second.
2. An app server dies: one instance of the app fleet is lost (a fleet of one is lost whole).
3. The cache dies: every cache is taken down, so every redirect asks the database.
4. The click worker dies: every worker is taken down for 60 seconds, then comes back.

Eleven checks read the four scenarios.

| Kind | Check | Scenario | Passes when |
|---|---|---|---|
| Functional | Shortening works | peak | a client reaches a database through an app server |
| Functional | A redirect returns the long URL | peak | the app server can read the link back from a database (the cache is optional) |
| Functional | Clicks are counted | peak | a click travels app server, queue, worker, database; with no queue at all, the click is written inline before the redirect answers |
| Non-functional | Serves the whole peak | peak | capacity is at least 3,000/s |
| Non-functional | p99 redirect latency | peak | p99 is at most 65 ms |
| Non-functional | Everyone is still served when an app server dies | app server dies | at least 99.9% of the load is still served |
| Non-functional | Everyone is still served when the cache dies | cache dies | at least 99.9% of the load is still served |
| Non-functional | p99 while the cache is down | cache dies | p99 is at most 100 ms |
| Non-functional | No clicks are lost when the worker dies | worker dies | a queue holds the clicks, and the workers drain 60 s of backlog within 120 s (a design with no queue has no worker to lose, and passes) |
| Non-functional | Availability | peak | the model's availability is at least 99.9% |
| Non-functional | Cost per hour | peak | at most $2.50 an hour |

Two rules of the challenge are worth saying out loud. A design with no queue counts clicks inline: every redirect writes one row to the database before it answers, as the code lab's `queue: false` mode does. That passes the functional check, and the model puts the 3,000 writes a second on the primary, so it only survives with a far larger database and then fails on cost. And the worker batches: a worker with batch size 1 sends every click to the database, which is the mistake the lab is built to show. A queue with no worker counts nothing, and fails the functional check.

**Cache wiring:** the app server may link to both the cache and the database (cache-aside: it asks the cache for every read, and only a miss reads the database), or the learner may also link the cache onward to the database (read-through: the cache loads from it on a miss). Both give the database the same load, reads times one minus the hit rate, counted once. The edge labels show each hop on its own: reads to the cache with the hit ratio, cache misses to the database, and click writes. In read-through the cache sits in the path, so its death cuts the database off and the cache-dies checks fail, which is the honest cost of that wiring.

**Assumptions:** steady state, the cache is warm, 99% of database traffic is reads, every redirect makes one click, and prices are illustrative. Redirects are the whole load; creating links is far rarer and is checked only by the shortening path.

**Limits:** a model, not a cloud. Latency is in model milliseconds, not the milliseconds of the code lab. "Served" is capacity over load, not a request-by-request count. A fleet spread over two zones counts as redundant even when it has one instance, which is a known simplification of the model. The queue is priced per message at an illustrative broker rate (the generic queue's price was lowered from a managed cloud rate so that counting 3,000 clicks a second does not dominate the bill), and it never fills.

## How the targets were tuned

Targets were set against the model first, then compared with what the real stack did. The real stack is the Docker lab in the system-design-labs repository, lab 1 (three API replicas behind nginx, Redis as cache and queue, Postgres, one worker). Its measured numbers are in that lab's `part-*/results.md`.

| What the real stack measured | The model's target |
|---|---|
| Warm redirects: 2,454 requests a second at 16 in flight, p99 13.1 ms, 98% served from the cache | Peak load 3,000/s, the same order of size, so the board and the code lab describe the same service |
| One API replica stopped: no failed redirects, p99 7.5 ms against 8.7 ms | The app-server check needs everyone served. It does not check p99, because losing a third of the fleet honestly costs some (58 to 77 ms in the reference) |
| Redis stopped: no failed redirects, cache hits fell to 15%, p99 8.7 to 252.7 ms | The cache check needs everyone served and p99 at most 100 ms, which only a read replica makes possible |
| Worker stopped for 8 s: no redirect affected, backlog grew by about 495 clicks a second, then emptied within about 4 s of the restart | 60 s of backlog must drain within 120 s, which needs spare worker capacity |
| Worker batches of 500 clicks | The batch size property on the worker, default 1 so a learner has to find the batching |

**Reconciled with the code lab's contract.** The code lab publishes `labs/lab-1-url-shortener/visual-lab-contract.md` (and a JSON copy): the components, knobs and 17 checks the real stack can be scored on. This lab uses the same components (the gateway is the load balancer, the API replicas are the app server fleet, Redis plays the cache and the queue, plus the worker and the database) and a subset of the checks, so a design built here can be replayed there.

| This lab's check | The contract's check |
|---|---|
| Shortening works | `create_link` |
| A redirect returns the long URL | `redirect_302` |
| Clicks are counted | `clicks_counted` |
| Serves the whole peak | `throughput_rps` (the contract's target is machine-sized, 800 req/s) |
| p99 redirect latency | `redirect_p99_ms` |
| Everyone is still served when an app server dies | `survives_replica_loss` |
| Everyone is still served when the cache dies, and p99 while it is down | `survives_cache_loss` |
| No clicks are lost when the worker dies | `worker_loss_clicks_caught_up` |
| Availability, Cost per hour | none: model only |

Checks the board does not model, because the model has no stale reads, no timeouts and no second Redis role: `alias_conflict_409`, `unknown_404` and `unique_codes` (part 1 of the code lab), `survives_db_loss_reads`, `db_down_redirect_p99_ms` and `db_down_fails_fast` (the code lab shows that cached redirects keep working while Postgres is stopped and that creating a link fails in 2 s; the board treats a dead database as a full outage), `click_loss_redis_down` and `recovers_within_s`. One of these matters for the debrief chapter: in the real stack Redis is both the cache and the queue, so stopping it lost 42% to 59% of the clicks. On the board the queue is its own part and does not die with the cache, so the board cannot show that, and chapter 30.3 asks the learner what they would change.

The model's numbers differ in size from the laptop's, so the targets compare shapes (a replica death costs a little, a cache death costs a lot unless the database has room, a worker death costs no redirects but needs spare capacity), not milliseconds.

**Checked against the model (3,000 req/s):**

| Design | Checks | Ceiling | p99 | Availability | Cost | Fails |
|---|---|---|---|---|---|---|
| Starting board (balancer, one app server, database) | 5/11 | 1,600 | 2,010 ms | 98.70% | $0.52/h | capacity, p99, app server dies, both cache-dies checks, availability |
| Reference (below) | 11/11 | 4,800 | 58 ms | 99.99% | $2.39/h | none |
| Reference without the read replica | 9/11 | 4,800 | 58 ms | 99.99% | $2.09/h | the two cache-dies checks (p99 583 ms, 80.6% served) |
| Reference without the cache | 10/11 | 4,800 | 71 ms | 99.99% | $2.24/h | p99 (the database sits at 62% busy) |
| Reference with one worker | 10/11 | 4,800 | 58 ms | 99.99% | $2.27/h | worker dies (2,400/s of workers against 3,000/s of clicks, never drains) |
| Reference with three workers | 10/11 | 4,800 | 58 ms | 99.99% | $2.51/h | cost (drains in 43 s, but $0.01 over) |
| Reference with batch size 1 | 8/11 | 4,618 | 72 ms | 99.99% | $2.39/h | p99 and both cache-dies checks (the database takes 3,000 writes a second) |
| Reference without queue and worker (clicks written inline) | 6/11 | 2,399 | 583 ms | 99.999% | $1.71/h | capacity, p99, app server dies, both cache-dies checks (the database takes 3,000 inline writes a second) |
| Same, with the database at memory-xlarge | 10/11 | 4,800 | 61 ms | 99.999% | $4.41/h | cost |
| Reference with a queue and no worker | 9/11 | 4,800 | 58 ms | 99.99% | $2.15/h | counting (nothing counts the clicks) and worker dies |
| Reference with two app servers | 9/11 | 4,800 | 77 ms | 99.98% | $2.27/h | p99, and app server dies (2,400/s left for 3,000/s) |
| Reference with one balancer zone | 5/11 | 1,600 | 186 ms | 99.89% | $2.19/h | capacity, p99, three fault checks, availability |
| Reference with big app and database sizes | 10/11 | 4,800 | 44 ms | 99.99% | $10.97/h | cost |

The reference design: a load balancer of size general-small in 3 zones; 3 app servers of size compute-small in 2 zones; one cache node of size memory-small at a 95% hit rate in 2 zones; a database of size memory-medium with a standby and 1 read replica at 99% reads; a queue; 2 workers of size compute-small with batch size 500. The app server links to the cache, the database and the queue; the queue links to the workers; the workers link to the database.

The cheapest passing design found is about $2.39 an hour, and the budget is $2.50, so a design with an extra instance or two sizes too large fails on cost alone.

**Try this**

1. Run the starting board. Expected: 5 of 11 pass. Shortening, redirecting and counting (inline) work, and the board says why the rest fail, starting with the load balancer at 188% busy.
2. Add a queue and a worker, link app server to queue to worker to database, and set the worker's batch size to 500. Expected: the database drops from over 100% busy (inline writes) to near idle. Set the batch size back to 1 and watch it become the busiest part again.
3. Add a cache at 95% hits, then run. Expected: p99 drops under 65 ms. Take the database's read replica away and run again: the cache-dies checks fail, because without the cache one database carries all 3,000 reads a second.

## Solution

The reference design is in `solution.ts` next to this file, and it passes all 11 checks at $2.39 an hour (the design recorded in the table above). The board offers it through a Solution button, after the learner has pressed Run once and confirmed. It opens read-only, labelled "Reference solution", with a button to copy it onto the learner's board and one to go back. Each part has a short explanation: why it is there, which checks it helps pass, and what happens without it.

| Part | Why it is there | Checks it helps pass |
|---|---|---|
| Load balancer, 3 zones | One small zone carries about 1,600 a second, so three carry the 3,000 | capacity, p99, every fault check |
| App servers, 3 in 2 zones | N+1: losing one leaves two at 63% | capacity, p99, app server dies, availability |
| Cache, 95% hits | Answers 2,850 of 3,000 reads, so a hit never asks the database | p99, both cache-dies checks |
| Database with standby and one replica | The replica carries all 3,000 reads if the cache dies; the standby keeps it up if its zone fails | availability, both cache-dies checks |
| Queue and 2 workers at batch 500 | Clicks wait safely and reach the database in about 6 writes a second | clicks counted, worker dies, p99 |

"Compare with mine" lists, in plain words, which parts, settings and links differ from the learner's design and which failing checks each one helps explain. It gives directions ("lower", "smaller") and no numbers, so it does not hand over the answer.
