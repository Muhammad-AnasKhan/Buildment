# Design a news feed (visual challenge)

**Claim:** a home feed that only saves posts and builds each feed from the database when it is opened is easy to build and easy to break. To pass, the design must also deliver every new post to the followers' feeds without making the author wait, open a feed fast at the busiest moment, and keep answering when an app server, the feed cache or the fan-out worker dies. Each of those needs a part, and each part costs money, so the lab asks for the cheapest design that survives.

**Inputs:** the parts the learner places (client, load balancer, app server, cache, database, queue, worker), the links between them, and per part its size, count, zones, and for the cache its hit rate, for the database its read replicas, standby and read share, and for the worker its count. The offered load is fixed by the brief at 3,200 feed opens a second, about a fifth of the 17,400 of chapter 21.1. The challenge sets `shares: { queue: 0.02 }`: 2 requests in 100 leave a post on the queue (see Assumptions).

**Rule:** the tiered-architecture model in `frontend/src/lab/tiered-architecture.ts`, played through four scenarios by `frontend/src/lab/challenge.ts`:

1. Peak traffic: everything healthy at 3,200 feed opens a second.
2. An app server dies: one instance of the app fleet is lost (a fleet of one is lost whole).
3. The feed cache dies: every cache is taken down, so every feed open asks the database.
4. The fan-out worker dies: every worker is taken down for 120 seconds, then comes back.

Eleven checks read the four scenarios.

| Kind | Check | Scenario | Passes when |
|---|---|---|---|
| Functional | A post is saved | peak | a client reaches a database through an app server |
| Functional | A feed can be opened | peak | the app server can read posts from the database (the cache is optional) |
| Functional | A new post reaches followers' feeds | peak | a post travels app server, queue, worker, cache of ready feeds |
| Non-functional | Serves the whole peak | peak | capacity is at least 3,200/s |
| Non-functional | p99 feed-open latency | peak | p99 is at most 65 ms |
| Non-functional | Everyone is still served when an app server dies | app server dies | at least 99.9% of the load is still served |
| Non-functional | Everyone is still served when the feed cache dies | cache dies | at least 99.9% of the load is still served |
| Non-functional | p99 while the feed cache is down | cache dies | p99 is at most 100 ms |
| Non-functional | No posts are lost when the worker dies | worker dies | a queue holds the posts, and the worker delivers 120 s of waiting posts within 10 s |
| Non-functional | Availability | peak | the model's availability is at least 99.9% |
| Non-functional | Cost per hour | peak | at most $1.95 an hour |

Two rules of the challenge are worth saying out loud. The delivery check needs the whole chain app server, queue, worker, cache. A design with no queue passes saving and reading, because the app server can read the database directly (this is fan-out on read, chapter 21.3), and fails delivery and the worker check: there is nowhere for a post to wait. A queue with no worker, or a worker not linked to a cache, delivers nothing and fails the same checks. The lab leaves `inlineClicks` off, so a design with no queue does not pass the drain check by "doing the work inline".

**Cache wiring:** the app server links to both the cache and the database (cache-aside: it asks the cache first, and only a miss reads the database). The worker links to the cache, because the cache is where the ready feeds live. The database sees feed reads times one minus the hit rate, counted once.

**Assumptions:** steady state, the feed cache is warm, 98% of database traffic is reads (the 50 to 1 ratio of chapter 21.1), and prices are illustrative. **The queue share is 0.02.** Chapter 21.1 counts 10,000,000 posts a day against 500,000,000 feed opens a day, so 1 request in 50 is a post and leaves one job on the queue. At the 3,200 a second peak that is 64 jobs a second. The share follows the app server's link to the queue, and the worker behind the queue gets the same share. Links to the cache and the database still carry the whole stream.

**Limits:** a model, not a cloud. Latency is in model milliseconds, not the 200 ms of chapter 21.1. "Served" is capacity over load. Each job on the queue counts as one unit of work, however many followers the post has, so the board cannot show the celebrity problem (one post from an account with 20 million followers is 20 million feed writes, chapter 21.3), a cache that comes back empty after a restart, ranking (chapter 21.4), or a post that reaches some feeds and not others. The worker's batch size does not apply to writes into a cache in this model, so it is not a lever here. The queue is priced per message and never fills.

## How the targets were tuned

Targets were set against the model. There is no code lab for this challenge yet (only the URL shortener has one), so no real stack was measured and none of these numbers is compared with one.

**Checked against the model (3,200/s):**

| Design | Checks | Ceiling | p99 | Availability | Cost | Fails |
|---|---|---|---|---|---|---|
| Starting board (balancer, one app server, database) | 3/11 | 1,600 | 2,010 ms | 98.70% | $0.52/h | delivery, capacity, p99, app server dies, both cache-dies checks, worker dies, availability |
| Reference (below) | 11/11 | 4,800 | 60 ms | 99.99% | $1.85/h | none |
| Reference without the read replica | 9/11 | 4,800 | 61 ms | 99.99% | $1.55/h | the two cache-dies checks (p99 585 ms, 76.5% served) |
| Reference without the standby | 10/11 | 4,800 | 60 ms | 99.84% | $1.55/h | availability |
| Reference with the cache in one zone | 10/11 | 4,800 | 60 ms | 99.84% | $1.85/h | availability (the cache is the weak link) |
| Reference without the cache | 9/11 | 4,800 | 75 ms | 99.99% | $1.70/h | delivery (the worker has nowhere to write) and p99 |
| Reference without the queue | 9/11 | 4,800 | 60 ms | 99.999% | $1.83/h | delivery and worker dies (posts have nowhere to wait) |
| Reference without the worker | 9/11 | 4,800 | 60 ms | 99.99% | $1.73/h | delivery and worker dies (posts pile up) |
| Reference with the worker not linked to the cache | 10/11 | 4,800 | 60 ms | 99.99% | $1.85/h | delivery |
| Reference with two workers | 10/11 | 4,800 | 60 ms | 99.99% | $1.97/h | cost |
| Reference with three workers | 10/11 | 4,800 | 60 ms | 99.99% | $2.09/h | cost |
| Reference with two app servers | 9/11 | 4,800 | 84 ms | 99.98% | $1.73/h | p99, app server dies (75.0% served) |
| Reference with one app server | 6/11 | 2,400 | 1,358 ms | 99.98% | $1.61/h | capacity, p99, app server dies, both cache-dies checks |
| Reference with four app servers | 10/11 | 4,800 | 54 ms | 99.99% | $1.97/h | cost |
| Reference with two balancer zones | 9/11 | 3,200 | 188 ms | 99.99% | $1.75/h | p99, cache-dies p99 |
| Reference with one balancer zone | 5/11 | 1,600 | 188 ms | 99.89% | $1.65/h | capacity, p99, three fault checks, availability |
| Reference with a smaller database (memory-small) | 9/11 | 4,800 | 61 ms | 99.99% | $1.40/h | the two cache-dies checks |
| Reference with a bigger database (memory-large) and no read replica | 10/11 | 4,800 | 60 ms | 99.99% | $2.15/h | cost |
| Reference with a 70% hit rate | 11/11 | 4,800 | 62 ms | 99.99% | $1.85/h | none |

The last row is on purpose: the cache's hit rate is not what the checks measure. With a read replica the database has room even at 70%, so a lower hit rate still passes. What the checks test is that the cache is there to take the posts, and that the design survives without it.

The reference design: a load balancer of size general-small in 3 zones; 3 app servers of size compute-small in 2 zones; one cache node of size memory-small at a 95% hit rate in 2 zones; a database of size memory-medium with a standby and 1 read replica at 98% reads; a queue; 1 worker of size compute-small. The app server links to the cache, the database and the queue; the queue links to the worker; the worker links to the cache.

In the reference at peak: the balancer is 67% busy, the app servers 44% (67% with one gone), the cache 11%, the database 3% (65% when the cache is down), and the worker 3% (64 jobs a second against 2,400). After a 120 second outage 7,680 posts wait, and the worker delivers them all 4 seconds after it returns. The worker check is the least demanding of the eleven once a queue and a worker are linked: with only 1 request in 50 being a post, one small worker has plenty of room, so it fails only for a missing queue, worker or link, and a second worker only costs money. Where the work gets heavy is a post from an account with millions of followers, which the board cannot show.

The cheapest passing design found is $1.85 an hour, and the budget is $1.95, so a design with one extra instance or one size too large fails on cost alone.

**Try this**

1. Run the starting board. Expected: 3 of 11 pass. Saving a post and opening a feed work, and the board says why the rest fail, starting with the load balancer at 200% busy.
2. Add a cache, a queue and a worker, and link app server to cache, app server to queue, queue to worker and worker to cache. Expected: delivery turns green. Take the cache away again and watch p99 climb to 75 ms and delivery fail.
3. Take the database's read replica away, then run. Expected: the two cache-dies checks fail, because without the cache one database carries all 3,200 reads a second (131% busy, 76.5% served).
4. Add a second worker and run. Expected: the worker check stays green and the cost check fails ($1.97 an hour against $1.95). Click the queue and read its link label: about 2% of requests send work there.

## Solution

The reference design is in `solution.ts` next to this file, and it passes all 11 checks at $1.85 an hour (the design recorded in the table above). The board offers it through a Solution button, after the learner has pressed Run once and confirmed. It opens read-only, labelled "Reference solution", with a button to copy it onto the learner's board and one to go back. Each part has a short explanation: why it is there, which checks it helps pass, and what happens without it.

| Part | Why it is there | Checks it helps pass |
|---|---|---|
| Load balancer, 3 zones | One small zone carries about 1,600 a second, so three carry the 3,200 | capacity, p99, every fault check |
| App servers, 3 in 2 zones | N+1: losing one leaves two at 67% | capacity, p99, app server dies, availability |
| Feed cache, 95% hits | Holds the ready feeds and answers 3,040 of 3,200 opens, so only 160 reach the database | delivery, p99, both cache-dies checks |
| Queue and 1 worker | Posts wait safely and are delivered to the feeds; only 1 request in 50 is a post, so one small worker is 3% busy | delivery, worker dies |
| Database with standby and one replica | The replica carries all 3,200 reads if the cache dies; the standby keeps it up if its zone fails | availability, both cache-dies checks |

"Compare with mine" lists, in plain words, which parts, settings and links differ from the learner's design and which failing checks each one helps explain. It gives directions ("lower", "smaller") and no numbers, so it does not hand over the answer.
