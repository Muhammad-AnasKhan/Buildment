# Design a web crawler (visual challenge)

**Claim:** a crawler that only fetches pages is easy to build and easy to break. To pass, the design must also save every page, send the links it finds back as new work, and keep fetching when a fetcher, the seen-URL memory or the page parsers die. Each of those needs a part, saving pages is a paid request every time, and the budget is tight, so the lab asks for the cheapest design that survives.

**Inputs:** the parts the learner places (client, load balancer, app server, cache, NoSQL store, object storage, queue, worker), the links between them, and per part its size, count, zones, and for the cache its hit rate and for the worker its batch size. The offered load is fixed by the brief at 2,700 pages to fetch a second.

**What each board part stands for.** A crawler has no users clicking, so the client is the scheduler that releases URLs whose turn has come. The load balancer spreads the fetch jobs over the fetchers (in the real design by a hash of the website, chapter 26.2). The app server is the fetcher fleet. The cache is the seen-URL memory (chapter 26.4). The NoSQL store is the URL table. The queue holds downloaded pages. The worker is the page parser: it saves the page to object storage and writes the links it found to the URL table. The board shows the catalog names (App server, Worker, Cache); the chapters say what each one is in DalilBot.

**Rule:** the tiered-architecture model in `frontend/src/lab/tiered-architecture.ts`, played through four scenarios by `frontend/src/lab/challenge.ts`:

1. Peak traffic: everything healthy at 2,700 pages a second.
2. A fetcher dies: one instance of the fetcher fleet is lost (a fleet of one is lost whole).
3. The seen-URL memory dies: every cache is taken down, so every "did we fetch this?" question asks the URL table.
4. The page parsers die: every worker is taken down for 60 seconds, then comes back.

Eleven checks read the four scenarios.

| Kind | Check | Scenario | Passes when |
|---|---|---|---|
| Functional | Fetched pages are saved | peak | a client reaches object storage through a fetcher (straight from the fetcher, or through a queue and a parser) |
| Functional | Each fetched address is recorded in the URL table | peak | a client reaches a NoSQL store through a fetcher (the cache is optional) |
| Functional | Links found on a page come back as new work | peak | a link travels fetcher, queue, parser, URL table |
| Non-functional | Fetches the whole peak | peak | capacity is at least 2,700/s |
| Non-functional | p99 fetch job latency | peak | p99 is at most 55 ms |
| Non-functional | Every page is still fetched when one fetcher dies | fetcher dies | at least 99.9% of the load is still served |
| Non-functional | Every page is still fetched when the seen-URL memory dies | memory dies | at least 99.9% of the load is still served |
| Non-functional | p99 while the memory is down | memory dies | p99 is at most 65 ms |
| Non-functional | No downloaded pages are lost when the parsers die | parsers die | a queue holds the pages, and the parsers drain 60 s of backlog within 90 s (a design with no queue loses them and fails) |
| Non-functional | Availability | peak | the model's availability is at least 99.9% |
| Non-functional | Cost per hour | peak | at most $5.60 an hour |

**Why the parsers sit behind the queue.** The model only counts the synchronous path (the scheduler, balancer, fetchers, their stores and the queue) for capacity, p99 and "served". A worker behind a queue is asynchronous: its slowness builds a backlog, which the drain check reads, and does not slow a fetch job. This is why the fetchers are the app-server part and the parsers are the worker part. A fetcher fleet behind a queue would be invisible to every capacity and fault check.

**Cache wiring:** link the fetcher to both the seen-URL memory and the URL table (cache-aside: it asks the memory first, and only a miss reads the table). The table's load is then reads times one minus the hit rate, plus the parsers' writes divided by the batch size. The board does not punish a memory linked in series (fetcher to memory to table), because the parsers' own link keeps the table reachable. A real design linked that way would be cut off from the table when the memory dies, so link both.

**Assumptions:** steady state, the seen-URL memory is warm, every fetched page makes one seen-URL question and one message for the parser, and prices are illustrative. Peak is about 3.5 times the 770 pages a second average of chapter 26.1 (2,000,000,000 pages a month divided by 2,592,000 seconds).

**Limits:** a model, not a cloud. Latency is in model milliseconds. "Served" is capacity over load. A fleet spread over two zones counts as redundant even with one instance, which is a known simplification of the model. A fetcher is counted by the model's generic rule of 1,200 requests per vCPU, not by the 100 downloads in flight of chapter 26.2, so the board's fleet is smaller than the 8 to 10 machines that chapter plans; compare shapes, not machine counts. Each page makes one seen-URL question here, while chapter 26.1 counts about 50 links per page, so the real question rate is far higher. The queue is priced per message at an illustrative broker rate and never fills. Object storage is priced per request at an illustrative rate, which makes saving pages the largest bill ($3.90 of $5.50). The board cannot show politeness (the wait between two requests to one site, chapter 26.3), robots.txt, a revisit schedule, near-duplicate pages or crawler traps (chapter 26.4): the model has no notion of a website, so every fetch job is the same.

## How the targets were tuned

Targets were set against the model, with the load taken from chapter 26.1 (770 pages a second on average, a peak factor of about 3.5). There is no code lab for the crawler yet, so there is no real-stack measurement to compare with and none is quoted. The code lab is coming; when it exists, its contract file should map each check id here to a check there.

**Checked against the model (2,700 pages a second):**

| Design | Checks | Ceiling | p99 | Availability | Cost | Fails |
|---|---|---|---|---|---|---|
| Starting board (balancer, one fetcher, URL table, object storage) | 3/11 | 1,600 | 1,497 ms | 98.74% | $4.27/h | links come back, capacity, p99, fetcher dies, both memory-dies checks, parsers die, availability |
| Reference (below) | 11/11 | 4,800 | 52 ms | 99.99% | $5.50/h | none |
| Reference without the seen-URL memory | 10/11 | 3,992 | 62 ms | 99.99% | $5.35/h | p99 (the table sits at 68% busy) |
| Reference with the memory in one zone | 10/11 | 4,800 | 52 ms | 99.84% | $5.50/h | availability |
| Reference with the URL table in one zone | 10/11 | 4,800 | 52 ms | 99.89% | $5.50/h | availability |
| Reference with batch size 1 | 8/11 | 3,810 | 64 ms | 99.99% | $5.50/h | p99 and both memory-dies checks (the table takes 2,700 writes a second; 74.0% served, p99 380 ms when the memory dies) |
| Reference with one parser | 10/11 | 4,800 | 52 ms | 99.99% | $5.38/h | parsers die (2,400/s of parsers against 2,700/s of pages, never drains) |
| Reference with three parsers | 10/11 | 4,800 | 52 ms | 99.99% | $5.62/h | cost ($0.02 over; drains in 36 s) |
| Reference with two table nodes | 10/11 | 4,800 | 52 ms | 99.99% | $5.65/h | cost |
| Reference with no queue and no parsers (fetchers save pages) | 7/11 | 4,800 | 67 ms | 99.99% | $4.86/h | links come back, p99, memory-dies p99, parsers die (162,000 pages lost in 60 s) |
| Reference with a queue and no parser | 7/11 | 4,800 | 67 ms | 99.98% | $5.26/h | links come back, p99, memory-dies p99, parsers die (nothing parses the pages) |
| Reference with two fetchers | 8/11 | 4,800 | 65 ms | 99.98% | $5.38/h | p99, fetcher dies (2,400/s left for 2,700/s, 88.8% served), memory-dies p99 |
| Reference with one fetcher | 6/11 | 2,400 | 1,353 ms | 99.98% | $5.26/h | capacity, p99, fetcher dies, memory dies, memory-dies p99 |
| Reference with one balancer zone | 5/11 | 1,600 | 181 ms | 99.89% | $5.30/h | capacity, p99, fetcher dies, memory dies, memory-dies p99, availability |
| Reference with two balancer zones | 9/11 | 3,200 | 60 ms | 99.99% | $5.40/h | p99 and memory-dies p99 (the balancer is 84% busy) |
| Reference without object storage | 10/11 | 4,800 | 52 ms | 99.99% | $1.60/h | fetched pages are saved |
| Reference without the URL table | 9/11 | 4,800 | 52 ms | 99.99% | $5.35/h | recorded in the URL table, links come back |
| Reference with big fetcher, parser and table sizes | 10/11 | 4,800 | 42 ms | 99.99% | $7.75/h | cost |

Designs that also pass all 11 checks: the reference with the memory removed and two table nodes ($5.50/h, p99 54 ms), the reference with a memory at a 50% hit rate ($5.50/h, p99 54 ms), and the reference with the table and the memory at size general-small ($5.40/h, p99 52 ms). The memory is one good way to protect the table, not the only one, which is why no check names it. A fetcher that saves its own page also passes the save check, at the price of p99.

The reference design: a load balancer of size general-small in 3 zones; 3 fetchers (app server) of size compute-small in 2 zones; one seen-URL memory (cache) node of size memory-small at a 95% hit rate in 2 zones; a URL table (NoSQL store) of one memory-small node in 2 zones; a queue; 2 parsers (worker) of size compute-small with batch size 500; object storage. The fetcher links to the memory, the table and the queue; the queue links to the parsers; the parsers link to object storage and to the table.

The cheapest passing design found is $5.40 an hour: the reference with the table and the memory both at size general-small instead of memory-small (p99 52 ms). The reference keeps memory-small so that the parts read as a memory and a table. The budget is $5.60, so one extra instance or one size too large fails on cost alone. The cost check is mostly a fixed bill: object storage and the queue together are $4.30 of the $5.50, and only about $1.20 is open to choice.

**Try this**

1. Run the starting board. Expected: 3 of 11 pass. Fetching, saving and recording work, and the board says why the rest fail, starting with the load balancer at 169% busy.
2. Add a queue and a worker, link fetcher to queue to worker to table, and set the worker's batch size to 500. Expected: the "links come back" check turns green and the parsers check shows 162,000 pages waiting. With one worker it never clears. Set the batch size back to 1 and watch the table become the busiest part when the memory is down.
3. Add a cache at 95% hits next to the table, linked from the fetcher, then run. Expected: p99 drops under 55 ms. Take the cache away and run again: the table goes to 68% busy and p99 is 62 ms.

## Solution

The reference design is in `solution.ts` next to this file, and it passes all 11 checks at $5.50 an hour (the design recorded in the table above). The board offers it through a Solution button, after the learner has pressed Run once and confirmed. It opens read-only, labelled "Reference solution", with a button to copy it onto the learner's board and one to go back. Each part has a short explanation: why it is there, which checks it helps pass, and what happens without it.

| Part | Why it is there | Checks it helps pass |
|---|---|---|
| Load balancer, 3 zones | One small zone carries about 1,600 a second, so three carry the 2,700 | capacity, p99, every fault check |
| Fetchers, 3 in 2 zones | N+1: losing one leaves two at 56% | capacity, p99, fetcher dies, availability |
| Seen-URL memory, 95% hits | Answers 2,565 of 2,700 questions, so the table sees about 135 a second | p99, both memory-dies checks, availability |
| URL table, 2 zones | Keeps every address; stays up if a zone fails | recorded in the table, links come back, availability |
| Queue and 2 parsers at batch 500 | Pages wait safely and the table sees about 5 writes a second | links come back, parsers die, p99 |
| Object storage | Keeps every page; the biggest bill | pages are saved, cost |

"Compare with mine" lists, in plain words, which parts, settings and links differ from the learner's design and which failing checks each one helps explain. It gives directions ("lower", "smaller") and no numbers, so it does not hand over the answer.
