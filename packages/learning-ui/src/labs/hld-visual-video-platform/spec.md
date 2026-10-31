# Design a video platform (visual challenge)

**Claim:** a video platform that only plays videos is easy to draw and easy to break. To pass, the design must also record uploads and turn them into playable video, and keep answering when a CDN network, an app server or the transcoding workers stop. Each of those needs a part, and each part costs money, so the lab asks for the cheapest design that survives. The lab also shows what the board cannot judge: the largest cost of video, the bytes, is not in the model.

**Inputs:** the parts the learner places (client, CDN, load balancer, app server, database, queue, worker, object storage), the links between them, and per part its size, count and zones; for the CDN its hit rate, for the database its read replicas, standby and read share, and for the worker its count. The offered load is fixed by the brief at 1,500 requests a second reaching the CDN.

**Rule:** the tiered-architecture model in `frontend/src/lab/tiered-architecture.ts`, played through four scenarios by `frontend/src/lab/challenge.ts`:

1. Peak traffic: everything healthy at 1,500 requests a second.
2. A CDN network goes down: the first CDN on the board is lost (a CDN is a managed service, so the whole part goes).
3. An app server dies: one instance of the app fleet is lost (a fleet of one is lost whole).
4. The transcoding workers stop: every worker is taken down for 60 seconds, then comes back.

Nine checks read the four scenarios.

| Kind | Check | Scenario | Passes when |
|---|---|---|---|
| Functional | A video plays | peak | a piece of video can be fetched: a client reaches object storage through a CDN |
| Functional | An upload is started and recorded | peak | a client reaches a database through a load balancer and an app server |
| Functional | An upload becomes playable | peak | a conversion job travels app server, queue, worker, object storage |
| Non-functional | p99 | peak | p99 is at most 55 ms |
| Non-functional | Everyone is still served when one CDN network goes down | CDN down | at least 99.9% of the load is still served |
| Non-functional | Everyone is still served when one app server dies | app server dies | at least 99.9% of the load is still served |
| Non-functional | No conversion jobs are lost when the workers stop | workers stop | a queue holds the jobs, and the workers convert 60 s of backlog within 20 s of coming back |
| Non-functional | Availability | peak | the model's availability is at least 99.95% |
| Non-functional | Cost per hour | peak | at most $7.60 an hour |

**What the peak means.** The board sends the offered load, 1,500 a second, to the client, and the client sends all of it to every CDN it is linked to. With two CDNs linked, each takes half (750 a second). A CDN answers its hit rate itself and passes the rest on. The model gives that stream of misses (750 a second at a hit rate of 0.5) in full to each different kind of part behind the CDN: object storage, the load balancer and, through the app server, the database and the queue. So one request on this board is one small step of work: a play piece that missed the edge, a watch page, or a slice of an upload. Real Lamha has far more plays than uploads (chapter 27.1). The board mixes them so that every part carries a load that a few small machines can handle.

**Cache and hit rate:** the hit rate is a number the learner sets on each CDN. The brief says Lamha's logs show 0.5 (chapter 27.4 explains why a long catalogue pulls it down), and the starting board has it. The board cannot stop a learner typing 0.95, which makes every check pass for $5.47 an hour (see the table). That is a wish and not a measurement, and chapter 38.3 says so. The same free dial exists on the URL shortener's cache.

**Assumptions:** steady state, every CDN has the same hit rate whatever is asked of it, 95% of database traffic is reads, the workers write only to object storage, and prices are illustrative (catalog.ts: a CDN is $0.02 an hour plus $0.75 per million requests, object storage $0.01 plus $0.40 per million, a queue $0.01 plus $0.04 per million). Uploads, plays and watch pages are one stream.

**Limits:** a model, not a cloud. The model counts requests and has no bytes. It cannot show bandwidth (the 12.5 Tbit/s of chapter 27.1), the bill for data sent out of the cloud (egress), the player choosing a quality from the network speed (adaptive bitrate, chapter 27.4), the chunked resumable upload (27.3), or a transcoding job that takes seconds. A worker does 2,400 jobs a second per compute-small, like any server, and a CDN costs more per request than object storage does, which is the opposite of the real bill: a CDN pays for itself in bytes, and the board does not charge bytes. A second CDN is nearly free here (its $0.02 hourly fee) where a real contract is not, and when one CDN fails, the other keeps the hit rate it already had where a real one would start cold. The path checks follow the links by any route, so the play check passes if the CDN reaches object storage even through the load balancer, app server, queue and worker. Latency is in model milliseconds. The queue never fills. The code lab for this case study does not exist yet.

## How the targets were tuned

Targets were set against the model: the starting board must fail several checks with a reason, the reference must pass with a little room on cost, and each part taken out of the reference must fail at least one check. There is no code lab for this case study yet, so there are no real-stack numbers to compare with, and none are quoted. The targets compare shapes (a lost CDN is an outage unless there is a second, a lost app server is an outage for a fleet of one, workers need spare capacity to catch up), not milliseconds.

**Checked against the model (1,500 requests a second):**

| Design | Checks | Ceiling | p99 | Availability | Cost | Fails |
|---|---|---|---|---|---|---|
| Starting board (one CDN, one balancer zone, one app server, a small database, no queue) | 3/9 | 2,526 | 65 ms | 98.68% | $5.53/h | playable, p99, CDN down, app server dies, workers stop, availability |
| Reference (below) | 9/9 | 5,053 | 50 ms | 99.96% | $7.51/h | none |
| Reference with one CDN | 8/9 | 5,053 | 50 ms | 99.95% | $7.49/h | CDN down (0.0% served) |
| Reference with one balancer zone | 8/9 | 3,200 | 51 ms | 99.86% | $7.41/h | availability |
| Reference with one app server | 8/9 | 4,800 | 55 ms | 99.96% | $7.39/h | app server dies (0.0% served) |
| Reference with both app servers in one zone | 8/9 | 5,053 | 50 ms | 99.91% | $7.51/h | availability |
| Reference without the read replica | 8/9 | 2,526 | 58 ms | 99.96% | $7.36/h | p99 (the database is 59% busy) |
| Reference without the standby | 8/9 | 5,053 | 50 ms | 99.81% | $7.36/h | availability |
| Reference without queue and worker | 7/9 | 5,053 | 50 ms | 99.97% | $6.07/h | playable, workers stop (90,000 jobs lost in 60 s) |
| Reference with a queue and no worker | 7/9 | 5,053 | 50 ms | 99.96% | $6.19/h | playable, workers stop (jobs never converted) |
| Reference with one worker | 8/9 | 5,053 | 50 ms | 99.96% | $7.39/h | workers stop (28 s to convert the backlog, 20 allowed) |
| Reference with three workers | 8/9 | 5,053 | 50 ms | 99.96% | $7.63/h | cost |
| Reference with three app servers | 8/9 | 5,053 | 48 ms | 99.97% | $7.63/h | cost |
| Reference with three balancer zones | 8/9 | 5,053 | 49 ms | 99.96% | $7.61/h | cost |
| Reference with a memory-medium database and no replica | 8/9 | 5,053 | 50 ms | 99.96% | $7.66/h | cost |
| Reference with larger machine sizes | 8/9 | 20,211 | 44 ms | 99.96% | $10.18/h | cost |
| Reference without object storage | 7/9 | 5,053 | 50 ms | 99.97% | $5.34/h | play, playable |
| Reference with the CDN hit rate at 0.3 | 8/9 | 3,609 | 54 ms | 99.96% | $8.42/h | cost (storage $3.03/h) |
| Reference with the CDN hit rate typed as 0.95 (a wish) | 9/9 | 50,526 | 43 ms | 99.96% | $5.47/h | none: the check cannot catch it |
| One CDN, and the client also linked straight to the load balancer | 6/9 | 1,684 | 130 ms | 99.95% | $9.86/h | p99, workers stop, cost (the balancer gets 2,250 a second) |
| Reference with the app server also linked to storage | 7/9 | 5,053 | 58 ms | 99.96% | $8.59/h | p99, cost (storage gets a third stream) |
| Reference with the CDN linked only to the load balancer | 9/9 | 5,053 | 50 ms | 99.97% | $6.43/h | none: a gap in the play check, see Limits |
| Reference with one compute-medium worker in place of two compute-small | 9/9 | 5,053 | 50 ms | 99.96% | $7.51/h | none: the same price |

The reference design: two CDNs, each at a hit rate of 0.5, both linked to object storage and to the load balancer; a load balancer of size general-small in 2 zones; 2 app servers of size compute-small in 2 zones; a database of size memory-small with 1 read replica, a standby and 95% reads; a queue; 2 workers of size compute-small linked to object storage. The app server links to the database and the queue; the queue links to the workers.

Where the money goes in the reference: the two CDNs $4.09 an hour (54% of the bill), object storage $2.17, the database $0.45, the app servers $0.24, the workers $0.24, the load balancer $0.20, the queue $0.12. Only about $1.25 an hour is machines the learner sizes. The budget is $7.60, so one extra instance, or one size too large, fails on cost alone.

The cheapest design found that follows the chapter 27 picture is $7.51 an hour. The $6.43 design above is cheaper because the model never charges the app server for reading video from storage, and it is not the target of the lab.

## Try this

1. Run the starting board. Expected: 3 of 9 pass. Plays and uploads work, and the board says why the rest fail, starting with the missing queue and the single CDN and app server (each shows 0.0% served when it dies).
2. Link the app server to a queue, the queue to a worker and the worker to object storage. Run again. Expected: the playable check passes. With one worker, the backlog of 45,000 jobs takes 28 s to clear, over the 20 s allowed. Add a second worker and it takes 12 s.
3. Add a second CDN, link it from the client to object storage and to the load balancer, and set its hit rate to 0.5. Run again. Expected: when one CDN goes down the other takes all 1,500 a second and everyone is served. Look at the cost: the second CDN added about $0.02, because the board charges per request, and the requests are the same.
4. Type 0.95 as both hit rates and run. Expected: every check passes at $5.47 an hour. Ask yourself what that proves (nothing: the catalogue sets the hit rate, and the board cannot check it), then set it back to 0.5.

## Solution

The reference design is in `solution.ts` next to this file, and it passes all 9 checks at $7.51 an hour (the design recorded in the table above). The board offers it through a Solution button, after the learner has pressed Run once and confirmed. It opens read-only, labelled "Reference solution", with a button to copy it onto the learner's board and one to go back. Each part has a short explanation: why it is there, which checks it helps pass, and what happens without it.

| Part | Why it is there | Checks it helps pass |
|---|---|---|
| CDN | Answers half the requests at the edge; costs $2.05 an hour per network | play, CDN down, cost |
| Second CDN | One network can fail; the second takes all 1,500 a second | CDN down |
| Load balancer, 2 zones | One small zone carries 1,600 a second and is a single point of failure | upload, availability |
| App servers, 2 in 2 zones | N+1: losing one leaves one at 31% | upload, app server dies, availability, p99 |
| Database with replica and standby | The replica keeps it at 30% busy; the standby keeps it up if its zone fails | upload, p99, availability |
| Queue | Holds 45,000 jobs while the workers are away | playable, workers stop |
| 2 workers | 4,050 jobs a second to spare, so the backlog clears in 12 s | playable, workers stop |
| Object storage | Holds the raw upload and the playable versions; $2.17 an hour in requests | play, playable, cost |

"Compare with mine" lists, in plain words, which parts, settings and links differ from the learner's design and which failing checks each one helps explain. It gives directions ("lower", "smaller") and no numbers, so it does not hand over the answer.
