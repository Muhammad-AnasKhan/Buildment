# Design a product search box (visual challenge)

**Claim:** a search box that only returns products is easy to build and easy to break. To pass, the design must also serve suggestions as the shopper types, get a seller's product change into the index, and keep answering when an app server, a search node or the indexing worker dies. Each of those needs a part, and each part costs money, so the lab asks for the cheapest design that survives. The case study is Dalil, the made-up marketplace search box of module 23.

**Inputs:** the parts the learner places (client, load balancer, app server, cache, search index, product database, queue, worker), the links between them, and per part its size, count, zones, and for the cache its hit rate, for the database its read share, read replicas and standby, and for the worker its count and size. The offered load is fixed by the brief at 3,000 lookups a second.

**Rule:** the tiered-architecture model in `frontend/src/lab/tiered-architecture.ts`, played through four scenarios by `frontend/src/lab/challenge.ts`:

1. Peak traffic: everything healthy at 3,000 lookups a second.
2. An app server dies: one instance of the app fleet is lost (a fleet of one is lost whole).
3. A search node dies: one node of the search index is lost (an index of one node is lost whole).
4. The indexing worker dies: every worker is taken down for 300 seconds (5 minutes), then comes back.

Twelve checks read the four scenarios.

| Kind | Check | Scenario | Passes when |
|---|---|---|---|
| Functional | A search returns products | peak | a client reaches a search node through an app server |
| Functional | A suggestion is served as you type | peak | a client reaches a cache through an app server |
| Functional | Results show full product details | peak | the app server can read the product from a database (the cache is optional) |
| Functional | A product change reaches the index | peak | a change travels app server, queue, worker, search node |
| Non-functional | Serves the whole peak | peak | capacity is at least 3,000/s |
| Non-functional | p99 | peak | p99 is at most 130 ms |
| Non-functional | Everyone is still served when an app server dies | app server dies | at least 99.9% of the load is still served |
| Non-functional | Everyone is still served when a search node dies | search node dies | at least 99.9% of the load is still served |
| Non-functional | p99 while a search node is down | search node dies | p99 is at most 160 ms |
| Non-functional | No product change is lost when the indexing worker dies | worker dies | a queue holds the changes, and the workers index a 300 s backlog within 30 s |
| Non-functional | Availability | peak | the model's availability is at least 99.95% |
| Non-functional | Cost per hour | peak | at most $2.50 an hour |

**The share of changes.** The challenge sets `shares: { queue: 0.025 }`: 1 lookup in 40 leaves a product change in the queue, wherever the learner links the queue, and the worker behind it gets the same share. The figure is the ratio of chapter 23.1: about 174 product changes a second against about 7,000 searches a second at the peak (174 / 7,000 = 2.5%). At 3,000 lookups a second that is 75 changes a second. Every other branch of the app server (cache, search index) still sees the whole stream. The board's "lookups" are search-sized requests: the 5 suggestion calls for each search of chapter 23.1 are not added on top, so the cache's suggestion path is checked by a link, not loaded separately.

**What the model does with this board, in plain words.** Load enters at the client and the cache, the search index and the product database (misses only) each see the lookups. A worker writes everything it takes from the queue to the search index, so the index carries the lookups and the shared changes together: 3,000 + 75 = 3,075 a second in the reference design. That is why the index is the biggest line on the bill. Each search node answers 300 lookups a second for each vCPU (the model's rule for a search node), so a memory-small node (2 vCPU) handles 600 a second and a memory-medium node (4 vCPU) 1,200. Because changes are rare, one worker is plenty, and the check that bites on the indexing path is whether there is a queue and a worker at all.

**Cache wiring:** the app server may link to both the cache and the database (cache-aside), or the learner may also link the cache onward to the database (read-through). Both give the database the same load, reads times one minus the hit rate. The cache never shields the search index in this model (a cache may link only to a database), so the cache's measurable job is to protect the database and to serve the suggestion path.

**Assumptions:** steady state, the cache is warm, 95% of the product database traffic is reads, and prices are illustrative. Freshness in module 23 is 30 seconds, so the drain check asks that the changes that waited through a 5 minute worker outage be indexed within 30 seconds of the worker coming back.

**Limits:** a model, not a cloud and not a search engine. Latency is in model milliseconds. "Served" is capacity over load, not a request-by-request count. A fleet spread over two zones counts as redundant even when it has one instance, which is a known simplification of the model. The queue is priced per message at an illustrative broker rate and never fills. The board does not rank results, so it cannot show ranking quality. It has no copies that refresh at different times, so it cannot show stale results between two shoppers. It treats the search nodes as one pool of equal nodes, not as 8 shards with copies, so it cannot show the slow-shard tail of chapter 23.2. A lookup goes to both the cache and the index, while in Dalil a suggestion never reaches the index, and a cache of popular searches would take load off it. The 1-in-40 share is a peak ratio from the course's own assumptions, not a measurement. There is no code lab for this design yet, so no number here was compared with a real stack.

## How the targets were tuned

Targets were set against the model alone: there is no paired code lab yet, so nothing was compared with a real run. The numbers compare shapes (a lost app server costs a little, a lost search node costs more because the index is the biggest part, a dead worker costs no searches but needs a queue), not milliseconds.

| Target | Why this value |
|---|---|
| Peak 3,000/s | The same size as module 30, small enough that one wrong size already shows |
| p99 at most 130 ms | The reference sits at 119 ms. Two balancer zones (146 ms), two app servers (138 ms) and seven search nodes (143 ms) each fail it |
| p99 at most 160 ms with a search node down | The reference sits at 143 ms. Eight small nodes lose an eighth when one dies; four bigger nodes lose a quarter and reach 221 ms |
| Drain: 300 s outage, 30 s to catch up | The module 23 freshness allowance. One worker clears 22,500 waiting changes in 10 s. With no queue the changes are lost; with no worker they are never indexed |
| Availability at least 99.95% | The reference sits at 99.98%. A single database, a cache in one zone, app servers in one zone and a balancer in one zone each fall below it |
| Cost at most $2.50 an hour | The reference costs $2.45, so one extra search node or a second worker goes over |

**Checked against the model (3,000 lookups a second, 1 in 40 leaving a change):**

| Design | Checks | Ceiling | p99 | Availability | Cost | Fails |
|---|---|---|---|---|---|---|
| Starting board (balancer, one app server, one search node, database) | 3/12 | 600 | 3,143 ms | 98.55% | $0.52/h | suggestion, index update, capacity, p99, app server dies, search node dies (served and p99), worker dies, availability |
| Reference (below) | 12/12 | 4,683 | 119 ms | 99.98% | $2.45/h | none |
| Reference with two balancer zones | 10/12 | 3,200 | 146 ms | 99.98% | $2.35/h | p99, search-dies p99 (170 ms) |
| Reference with one balancer zone | 6/12 | 1,600 | 247 ms | 99.88% | $2.25/h | capacity, p99, app server dies, search node dies (served and p99), availability |
| Reference with two app servers | 9/12 | 4,683 | 138 ms | 99.97% | $2.33/h | p99, app server dies (80% served), search-dies p99 (162 ms) |
| Reference with one app server | 7/12 | 2,400 | 1,418 ms | 99.97% | $2.21/h | capacity, p99, app server dies (0% served), search node dies (served and p99) |
| Reference with app servers in one zone | 11/12 | 4,683 | 119 ms | 99.93% | $2.45/h | availability |
| Reference without the cache | 6/12 | 1,263 | 583 ms | 99.99% | $2.30/h | suggestion, capacity, p99, app server dies, search node dies (served and p99); the database is 238% busy |
| Reference with the cache in one zone | 11/12 | 4,683 | 119 ms | 99.83% | $2.45/h | availability |
| Reference with seven search nodes | 10/12 | 4,098 | 143 ms | 99.98% | $2.30/h | p99, search-dies p99 (221 ms) |
| Reference with six search nodes | 9/12 | 3,512 | 221 ms | 99.98% | $2.15/h | p99, search node dies (97.5% served), search-dies p99 (1,716 ms) |
| Reference with four memory-medium search nodes | 11/12 | 4,683 | 119 ms | 99.98% | $2.45/h | search-dies p99 (221 ms) |
| Reference with nine search nodes | 11/12 | 4,800 | 108 ms | 99.98% | $2.60/h | cost |
| Reference without queue and worker | 10/12 | 4,800 | 116 ms | 99.99% | $2.31/h | index update, worker dies (every change in the outage is lost) |
| Reference with a queue and no worker | 10/12 | 4,800 | 116 ms | 99.98% | $2.33/h | index update, worker dies (never indexed) |
| Reference with two workers | 11/12 | 4,683 | 119 ms | 99.98% | $2.57/h | cost |
| Reference without the database standby | 11/12 | 4,683 | 119 ms | 99.83% | $2.30/h | availability |
| Reference without the database | 11/12 | 4,683 | 119 ms | 99.99% | $2.15/h | product details |

The reference design: a load balancer of size general-small in 3 zones; 3 app servers of size compute-small in 2 zones; one cache node of size memory-small at a 90% hit rate in 2 zones; 8 search nodes of size memory-small in 2 zones; a product database of size memory-small at 95% reads with a failover standby; a queue; 1 worker of size compute-small. The app server links to the cache, the search index, the database and the queue; the queue links to the worker; the worker links to the search index.

Two things the table shows that are worth saying aloud. The queue and worker barely load the index, so skipping them saves only about $0.14 an hour and looks almost as fast: a missing job is easy to miss, and only the change checks catch it. And in the app-server fault the reference leaves two servers at 63% busy and p99 near 138 ms: everyone is served, a little slower, and the lab does not check that number, as module 30 does not.

**Try this**

1. Run the starting board. Expected: 3 of 12 pass. A search returns products and the product details load, but the search index is 500% busy and the board names it first.
2. Add a cache at a 90% hit rate and link the app server to it. Expected: the suggestion check passes and the product database drops from 238% busy to 25%.
3. Add a queue and a worker and link app server to queue to worker to search. Expected: the index-update check passes and the index gets only a little busier, because 1 lookup in 40 leaves a change. Raise the search node count until capacity and p99 pass.
4. Take the number of search nodes down to seven, then replace eight small nodes with four medium nodes of the same cost. Run both and compare the search-dies p99.

## Solution

The reference design is in `solution.ts` next to this file, and it passes all 12 checks at $2.45 an hour (the design recorded in the table above). The board offers it through a Solution button, after the learner has pressed Run once and confirmed. It opens read-only, labelled "Reference solution", with a button to copy it onto the learner's board and one to go back. Each part has a short explanation: why it is there, which checks it helps pass, and what happens without it.

| Part | Why it is there | Checks it helps pass |
|---|---|---|
| Load balancer, 3 zones | One small zone carries about 1,600 a second, so three carry the 3,000 | capacity, p99, every fault check, availability |
| App servers, 3 in 2 zones | Losing one leaves two at 63% busy and everyone served | capacity, p99, app server dies, availability |
| Cache, 90% hits | Serves suggestions and answers 2,700 of 3,000 product lookups, so the database sees 300 | suggestion, capacity, p99, fault checks |
| Search index, 8 small nodes in 2 zones | Carries 3,075 a second (lookups and changes); losing one leaves 7 at 73% | search, index update, capacity, p99, search node dies |
| Queue and 1 worker | Changes wait safely; 2,325 a second to spare clears 22,500 in 10 s | index update, worker dies |
| Product database with standby | The source of truth; the standby keeps it up if its zone fails | product details, availability |

"Compare with mine" lists, in plain words, which parts, settings and links differ from the learner's design and which failing checks each one helps explain. It gives directions ("lower", "smaller") and no numbers, so it does not hand over the answer.
