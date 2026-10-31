# Design a chat service (visual challenge)

**Claim:** a chat back end that only saves messages is easy to build and easy to break. To pass, the design must also show who is online and alert phones whose app is closed, and it must keep answering when a connection server, the cache or the alert worker dies. Each of those needs a part, and each part costs money, so the lab asks for the cheapest design that survives.

**Inputs:** the parts the learner places (client, gateway, app server, cache, key-value store, queue, worker), the links between them, and per part its size, count and zones, for the cache its hit rate, and for the key-value store its node count and zones. The offered load is fixed by the brief at 4,000 chat requests a second at the busiest moment (people sending, opening chats and checking who is online). That is a first-city launch, well under the 14,000 messages a second of module 22.

**Rule:** the tiered-architecture model in `frontend/src/lab/tiered-architecture.ts`, played through four scenarios by `frontend/src/lab/challenge.ts`:

1. Peak traffic: everything healthy at 4,000 requests a second.
2. A connection server dies: one instance of the gateway fleet is lost (a fleet of one is lost whole).
3. The cache dies: every cache is taken down, so every request asks the message store.
4. The alert worker dies: every worker is taken down for 15 minutes (900 seconds), then comes back.

Eleven checks read the four scenarios.

| Kind | Check | Scenario | Passes when |
|---|---|---|---|
| Functional | A message is stored | peak | a client reaches a key-value store through a gateway and an app server |
| Functional | A friend's online dot can be read | peak | the app server can reach a cache |
| Functional | An alert reaches a closed app | peak | a client reaches a worker through a gateway, an app server and a queue |
| Non-functional | Serves the whole peak | peak | capacity is at least 4,000/s |
| Non-functional | p99 request latency | peak | p99 is at most 74 ms |
| Non-functional | Everyone is still served when a connection server dies | gateway dies | at least 99.9% of the load is still served |
| Non-functional | Everyone is still served when the cache dies | cache dies | at least 99.9% of the load is still served |
| Non-functional | p99 while the cache is down | cache dies | p99 is at most 120 ms |
| Non-functional | No alerts are lost when the worker dies | worker dies | a queue holds the alerts, and the workers drain 900 s of backlog within 120 s |
| Non-functional | Availability | peak | the model's availability is at least 99.9% |
| Non-functional | Cost per hour | peak | at most $1.55 an hour |

There is no inline mode in this lab. A design with no queue has nowhere for alerts to wait, so the alert check fails and the worker check reports the alerts lost. A queue with no worker sends nothing, and fails both checks.

**Wiring and shares:** when a cache and a store hang off the same app server, the model shows the cache every request and the store only the misses. The lab leans on that on purpose. The cache stands for the memory that holds who is online and the latest messages of busy chats, and a hit means the message store is not asked. The challenge sets `shares: { queue: 0.1 }`: 1 request in 10 leaves an alert job in the queue (module 22, chapter 22.2 assumes about 10% of deliveries find a phone off), and the worker behind the queue gets the same 400 jobs a second. The link label on the board says "10% of requests send work here". The worker is the part that would send the push alert. The queue is priced per message, and at this share it costs $0.07 an hour.

**Assumptions:** steady state, the cache is warm, every request counts alike, 1 request in 10 leaves an alert job, and prices are illustrative. The gateways are modelled by the requests they pass on. The number of open phone lines is not modelled.

**Limits:** a model, not a cloud. Latency is in model milliseconds. "Served" is capacity over load, not a request-by-request count. A fleet spread over two zones counts as redundant even when it has one instance, which is a known simplification of the model. There is no code lab for this case study yet, so no target was compared with a real stack. The board cannot show message order, delivery receipts (sent, delivered, read), a reconnect storm after a gateway dies (its phones all reconnect at once), or which messages are the ones that need an alert (the board uses a fixed 10% share). Chapter 33.3 asks the learner what they would add for each.

## How the targets were tuned

Targets were set against the model only. Peak load, budget and the 74 ms and 120 ms latency limits sit in the same range as the URL shortener lab, so small parts and their sizes matter. The reference was chosen first (the cheapest design found by searching sizes and counts of every part), then each target was set just beyond what a design missing one idea can reach.

**Checked against the model (4,000 requests a second):**

| Design | Checks | Ceiling | p99 | Availability | Cost | Fails |
|---|---|---|---|---|---|---|
| Starting board (2 gateways, 2 app servers, 1 store node) | 4/11 | 4,000 | 493 ms | 99.79% | $0.63/h | online dot, alert, p99, a connection server dies, p99 while the cache is down, worker dies (no queue, so alerts are lost), availability |
| Reference (below) | 11/11 | 7,200 | 72 ms | 99.93% | $1.48/h | none |
| Reference without the cache | 9/11 | 7,200 | 76 ms | 99.93% | $1.33/h | online dot (no cache to read), p99 |
| Reference with one store node | 10/11 | 7,200 | 72 ms | 99.93% | $1.33/h | p99 while the cache is down (400 ms, the node is 100% busy) |
| Reference with one store node of size memory-medium | 11/11 | 7,200 | 72 ms | 99.93% | $1.48/h | none (an equal-cost alternative) |
| Reference with both store nodes in one zone | 10/11 | 7,200 | 72 ms | 99.88% | $1.48/h | availability |
| Reference with the cache in one zone | 10/11 | 7,200 | 72 ms | 99.78% | $1.48/h | availability |
| Reference with 2 gateways | 9/11 | 4,800 | 90 ms | 99.93% | $1.36/h | p99, a connection server dies (60.0% served) |
| Reference with 4 gateways | 10/11 | 7,200 | 69 ms | 99.93% | $1.60/h | cost |
| Reference with 2 app servers | 9/11 | 4,800 | 147 ms | 99.92% | $1.36/h | p99, p99 while the cache is down (151 ms) |
| Reference with 4 app servers | 10/11 | 7,200 | 61 ms | 99.93% | $1.60/h | cost |
| Reference with app servers in one zone | 10/11 | 7,200 | 72 ms | 99.88% | $1.48/h | availability |
| Reference without queue and worker | 9/11 | 7,200 | 72 ms | 99.94% | $1.17/h | alert, worker dies (alerts have nowhere to wait) |
| Reference with a queue and no worker | 9/11 | 7,200 | 72 ms | 99.93% | $1.24/h | alert, worker dies (alerts pile up, never sent) |
| Reference with one worker | 10/11 | 7,200 | 72 ms | 99.93% | $1.36/h | worker dies (360,000 alerts waiting, drained in 180 s) |
| Reference with three workers | 10/11 | 7,200 | 72 ms | 99.93% | $1.60/h | cost (drains in 53 s) |
| Reference with three store nodes | 10/11 | 7,200 | 71 ms | 99.93% | $1.63/h | cost |
| Reference with big gateways, app servers and store | 10/11 | 28,800 | 44 ms | 99.93% | $5.14/h | cost |
| Reference with the cache hit rate at 50% | 11/11 | 7,200 | 73 ms | 99.93% | $1.48/h | none (the hit rate matters little while the store has room) |

The reference design: 3 gateways of size compute-small; 3 app servers of size compute-small in 2 zones; one cache node of size memory-small at a 90% hit rate in 2 zones; a key-value store of 2 nodes of size memory-small in 2 zones; a queue; 2 workers of size compute-small. The gateways link to the app servers; the app servers link to the cache, the store and the queue; the queue links to the workers.

The cheapest passing design found by a search over sizes and counts of every part is $1.48 an hour, and the budget is $1.55, so a design with one extra instance or one size too large fails on cost alone.

**Try this**

1. Run the starting board. Expected: 4 of 11 pass. Messages are stored, capacity just holds, and cost is low. The board says why the rest fail, starting with the store at 100% busy.
2. Add a cache and link the app server to it, then add a queue and a worker. Expected: the online-dot and alert checks turn green, and the worker check reports the number of alerts waiting and how long they take to clear. Change the worker count to 1, then 2, then 3 and watch the drain time (180 s, 82 s, 53 s) and the cost.
3. Take the second store node away and run again. Expected: the cache-dies p99 check fails, because without the cache one small node is 100% busy.

## Solution

The reference design is in `solution.ts` next to this file, and it passes all 11 checks at $1.48 an hour. The board offers it through a Solution button, after the learner has pressed Run once and confirmed. It opens read-only, labelled "Reference solution", with a button to copy it onto the learner's board and one to go back. Each part has a short explanation: why it is there, which checks it helps pass, and what happens without it.

| Part | Why it is there | Checks it helps pass |
|---|---|---|
| Gateways, 3 | Three carry 7,200 a second; losing one leaves two at 83% | capacity, p99, a connection server dies |
| App servers, 3 in 2 zones | 56% busy at peak, and a zone can fail | p99, p99 while the cache is down, availability |
| Cache, 90% hits | Answers online-dot lookups so the store sees 400 a second | online dot, p99, availability |
| Key-value store, 2 nodes in 2 zones | Carries all 4,000 a second if the cache stops (50% busy) | cache dies, p99 while the cache is down, availability |
| Queue and 2 workers | Alerts wait safely; 4,400 a second to spare clears 360,000 in 82 s | alert, worker dies |

"Compare with mine" lists, in plain words, which parts, settings and links differ from the learner's design and which failing checks each one helps explain. It gives directions ("lower", "smaller") and no numbers, so it does not hand over the answer.
