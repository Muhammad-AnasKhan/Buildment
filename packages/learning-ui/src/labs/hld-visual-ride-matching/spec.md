# Design a ride service that finds nearby drivers (visual challenge)

**Claim:** a ride service that only stores drivers' places and finds the ones near a rider is easy to build and easy to break. Driver phones report where they are far more often than riders ask for a ride, so the reports are the load. To pass, the design must keep each driver's latest place in memory instead of writing every report to a database, record the few trip events without slowing a request, and keep answering when an app server, a node of the location map or the trip worker dies. Each of those needs a part, and each part costs money, so the lab asks for the cheapest design that survives.

**Inputs:** the parts the learner places (client, load balancer, app server, cache, database, queue, worker), the links between them, and per part its size, count, zones, and for the cache its hit rate, for the database its read replicas, standby and read share, and for the worker its batch size. The offered load is fixed by the brief at 4,000 requests a second.

**Rule:** the tiered-architecture model in `frontend/src/lab/tiered-architecture.ts`, played through four scenarios by `frontend/src/lab/challenge.ts`:

1. Peak traffic: everything healthy at 4,000 requests a second.
2. An app server dies: one instance of the app fleet is lost (a fleet of one is lost whole).
3. A node of the location map dies: one instance of the cache fleet is lost (a map of one node is lost whole, and every request falls through to the database).
4. The trip worker dies: every worker is taken down for 60 seconds, then comes back.

Eleven checks read the four scenarios.

| Kind | Check | Scenario | Passes when |
|---|---|---|---|
| Functional | Drivers' places are stored and searched | peak | a client reaches a cache through an app server |
| Functional | A ride request becomes a saved trip | peak | a client reaches a database through an app server |
| Functional | Trip events are recorded | peak | an event travels app server, queue, worker, database |
| Non-functional | Serves the whole peak | peak | capacity is at least 4,000/s |
| Non-functional | p99 latency | peak | p99 is at most 72 ms |
| Non-functional | Everyone is still served when one app server dies | app server dies | at least 99.9% of the load is still served |
| Non-functional | Everyone is still served when a map node dies | map node dies | at least 99.9% of the load is still served |
| Non-functional | p99 while a map node is down | map node dies | p99 is at most 100 ms |
| Non-functional | No trip events are lost when the worker dies | worker dies | a queue holds the events, and the workers drain 60 s of backlog within 30 s (a design with no queue has nowhere for events to wait, and fails) |
| Non-functional | Availability | peak | the model's availability is at least 99.9% |
| Non-functional | Cost per hour | peak | at most $1.65 an hour |

The first functional check covers both a place report and a nearby search, because on the board both are a request that travels from the client through an app server to the location map. Their load is the same stream, and the model cannot tell them apart.

**Reading the cache here.** The cache is the location map (chapter 24.3). Its hit rate is the share of requests that the map answers on its own: a place report replaces the driver's last place, and a nearby search reads boxes. The rest (a ride request, a trip lookup) goes on to the database. The model sends only that share to the database, so the database sees about 200 requests a second at a 95% hit rate.

**The share for trip events.** The challenge sets `shares: { queue: 0.005 }`: 1 request in 200 leaves a trip event in the queue, which is 20 events a second at 4,000 requests a second. The figure comes from the module's own chapters. Chapter 24.1 puts ride requests at about 580 a second against about 290,000 other requests (250,000 location reports and 40,000 searches), which is 0.2%. Chapter 24.4 says 7 offers in 10 are accepted, so a ride needs about 1.4 offers. Counting one event for the request, one for each offer and one for the acceptance gives about 2.4 events a ride, and 0.2% times 2.4 is about 0.5%. The "2.4 events a ride" is a course assumption. The location reports themselves are not trip events: the map keeps only the latest place (chapter 24.3), and the history log of reports is a separate job that the board does not model.

**Why a map node dying is a lose-one-instance fault, not "the cache is down".** A real location map has no database behind it and refills from the drivers within one report interval (chapter 24.3). The model cannot say "serve an empty map for 4 seconds". It can say what a lost node costs: with two or more nodes the others carry on, and with one node every request falls through to the database. So the fault takes one instance, and a map with a single node is lost whole.

**Assumptions:** steady state, the map is warm, a first city with 16,000 drivers online reporting every 4 seconds (4,000 reports a second, from chapter 24.1's method), with the searches and ride requests inside the same 4,000 requests a second, and 1 request in 200 leaving a trip event. Half of the database's traffic reads (trip lookups) and half writes. Prices are illustrative.

**Limits:** a model, not a city. Latency is in model milliseconds. "Served" is capacity over load, not a request-by-request count. The model spreads load evenly over the nodes of a part, so it cannot show a crowded box such as a stadium after a match (one node getting far more than its share), places going stale, reports arriving out of order, or the few seconds in which a restarted node holds an empty map. A fleet spread over two zones counts as redundant even when it has one instance, a known simplification of the model. The queue is priced per message at an illustrative broker rate. With a share this small, the queue and the worker cost very little, and a worker's batch size makes no difference (20 events a second is 20 writes a second at a batch size of 1). There is no code lab for this design yet, so no number here is checked against a real stack.

## How the targets were tuned

Targets were set against the model only, using the tuning tool on the starting board, the reference design and the variants below. The load comes from chapter 24.1's method, cut down to a first city so that the numbers sit in the same range as the other visual labs: the model's machines carry thousands of requests a second, not the 250,000 of a million-driver service. The code lab for this design is coming; when it exists, its measured numbers will be compared with these targets, and a table of the checks it can score will be added here.

What the board is built to show is a shape, as in chapter 24.3: a place report is a write to memory and not a row in a database; a lost map node costs nothing if another node holds the rest, and everything if it was the only one; a trip worker's death is invisible to requests.

**Checked against the model (4,000 requests/s, 1 in 200 leaving a trip event):**

| Design | Checks | Ceiling | p99 | Availability | Cost | Fails |
|---|---|---|---|---|---|---|
| Starting board (balancer, one app server, database) | 2/11 | 1,600 | 1,525 ms | 98.70% | $0.52/h | places, events, capacity, p99, app server dies, both map-node checks, worker dies (no queue), availability |
| Reference (below) | 11/11 | 6,400 | 69 ms | 99.99% | $1.49/h | none |
| Reference with one medium balancer zone | 5/11 | 3,200 | 197 ms | 99.89% | $1.29/h | capacity, p99, app server dies (80% served), both map-node checks, availability |
| Reference with three small balancer zones | 10/11 | 4,800 | 76 ms | 99.99% | $1.39/h | p99 (the balancer is 83% busy) |
| Reference with three medium balancer zones | 10/11 | 7,200 | 67 ms | 99.99% | $1.69/h | cost |
| Reference with two app servers | 8/11 | 4,800 | 144 ms | 99.98% | $1.37/h | p99, app server dies (60% served), p99 with a map node down |
| Reference with one app server | 5/11 | 2,400 | 1,357 ms | 98.94% | $1.25/h | capacity, p99, app server dies, both map-node checks, availability |
| Reference with a one-node map | 9/11 | 6,400 | 69 ms | 99.99% | $1.34/h | both map-node checks (59.7% served, p99 594 ms: the database is 168% busy) |
| Same, with the database at memory-large | 10/11 | 6,400 | 69 ms | 99.99% | $2.24/h | cost |
| Reference without the map | 5/11 | 2,388 | 594 ms | 99.99% | $1.19/h | places, capacity, p99, app server dies, both map-node checks (the database is 168% busy) |
| Reference with a 70% hit rate | 10/11 | 6,400 | 77 ms | 99.99% | $1.49/h | p99 |
| Reference with a hit rate of 85% | 11/11 | 6,400 | 71 ms | 99.99% | $1.49/h | none, with 1 ms of room on p99 |
| Reference without the database standby | 10/11 | 6,400 | 69 ms | 99.84% | $1.34/h | availability |
| Reference with database memory-medium | 10/11 | 6,400 | 69 ms | 99.99% | $1.79/h | cost |
| Reference without queue and worker | 9/11 | 6,400 | 69 ms | 99.999% | $1.36/h | events, worker dies (no queue: nowhere for events to wait) |
| Reference with a queue and no worker | 9/11 | 6,400 | 69 ms | 99.99% | $1.37/h | events and worker dies (nothing saves the events) |
| Reference with two workers | 11/11 | 6,400 | 69 ms | 99.99% | $1.61/h | none, but $0.12 more |
| Reference with batch size 500 | 11/11 | 6,400 | 69 ms | 99.99% | $1.49/h | none (20 events a second needs no batching) |
| Reference with four app servers | 11/11 | 6,400 | 58 ms | 99.99% | $1.61/h | none, but $0.12 more |
| Reference with a three-node map | 11/11 | 6,400 | 69 ms | 99.99% | $1.64/h | none, but $0.15 more |
| Reference with big sizes everywhere | 10/11 | 19,200 | 44 ms | 99.99% | $5.47/h | cost |

The reference design: a load balancer of size general-medium in 2 zones; 3 app servers of size compute-small in 2 zones; a location map of 2 cache nodes of size memory-small at a 95% hit rate in 2 zones; a database of size memory-small with a standby, no read replica and 50% reads; a queue; 1 worker of size compute-small. The app server links to the cache, the database and the queue; the queue links to the worker; the worker links to the database.

The cheapest passing design found is about $1.49 an hour, and the budget is $1.65, so one extra instance fits and two do not. A few other designs also pass (a second worker, a fourth app server, a three-node map, a larger batch size); that is intended, because the lab scores what a design does and not which parts it uses. The drain check passes for every design that has a queue and a worker: 1,200 waiting events clear in 1 second. That is the honest result of a 1-in-200 share. The check separates "has a queue and a worker" from "has not", and it is not a sizing puzzle.

**Try this**

1. Run the starting board. Expected: 2 of 11 pass. Saving a trip works and the cost is low, and the board says why the rest fail, starting with the balancer at 250% busy, the first check, which asks for a location map the board does not have, and the second, which asks for a queue.
2. Add a cache, link the app server to it, and set its hit rate to 95%. Expected: the places check turns green (3 of 11), and the database falls from 83% busy to 4%, because only the misses reach it. The balancer and the app server are still over 100% busy.
3. Add a queue and a worker, link app server to queue to worker to database. Expected: the events check and the worker check pass, the worker is 1% busy, and the queue's link says "0.5% of requests send work here".
4. On the finished design, give the map one node and run: it passes the peak checks. Read the map-node scene: the database goes to 168% busy and only 60% are served. Add a second node and run again.
5. On the finished design, lower the hit rate from 95% to 70% and run: p99 rises from 69 to 77 ms, because more requests reach the database.

## Solution

The reference design is in `solution.ts` next to this file, and it passes all 11 checks at $1.49 an hour (the design recorded in the table above). The board offers it through a Solution button, after the learner has pressed Run once and confirmed. It opens read-only, labelled "Reference solution", with a button to copy it onto the learner's board and one to go back. Each part has a short explanation: why it is there, which checks it helps pass, and what happens without it.

| Part | Why it is there | Checks it helps pass |
|---|---|---|
| Load balancer, 2 medium zones | One medium zone carries about 3,200 a second, so two carry the 4,000 | capacity, p99, every fault check, availability |
| App servers, 3 in 2 zones | N+1: losing one leaves two at 83% busy | capacity, p99, app server dies, availability |
| Location map, 2 nodes, 95% hits | Answers almost every request from memory, and a lost node leaves the other | places, p99, both map-node checks |
| Database with a standby | Keeps trips safe and stays up if its zone fails; only 9% busy | trip, availability |
| Queue and 1 worker | The 20 trip events a second wait safely and are saved off the request path | events, worker dies |

"Compare with mine" lists, in plain words, which parts, settings and links differ from the learner's design and which failing checks each one helps explain. It gives directions ("lower", "smaller") and no numbers, so it does not hand over the answer.
