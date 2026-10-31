import type { SolutionDef } from "../types";

// The reference design recorded in spec.md: 11 of 11 checks at $5.50 an hour.
export const webCrawlerSolution: SolutionDef = {
  summary:
    "Spread the fetching over enough small parts that losing any one still leaves room: three balancer zones, three fetchers, a seen-URL memory in two zones in front of the URL table, and downloaded pages saved off the fetch path by a queue and two parsers that write to the table in groups.",
  board: {
    nodes: [
      { id: "client", kind: "client", x: 1, y: 0 },
      { id: "lb", kind: "load-balancer", x: 1, y: 1, props: { size: "general-small", zones: 3 } },
      { id: "fetch", kind: "app-server", x: 1, y: 2, props: { size: "compute-small", count: 3, azs: 2 } },
      { id: "seen", kind: "cache", x: 0, y: 3, props: { size: "memory-small", count: 1, hitRate: 0.95, azs: 2 } },
      { id: "q", kind: "queue", x: 2, y: 3 },
      { id: "urls", kind: "nosql", x: 1, y: 4, props: { size: "memory-small", count: 1, azs: 2 } },
      { id: "w", kind: "worker", x: 2, y: 4, props: { size: "compute-small", count: 2, batchSize: 500 } },
      { id: "pages", kind: "object-storage", x: 3, y: 4 },
    ],
    edges: [
      { from: "client", to: "lb" },
      { from: "lb", to: "fetch" },
      { from: "fetch", to: "seen" },
      { from: "fetch", to: "urls" },
      { from: "fetch", to: "q" },
      { from: "q", to: "w" },
      { from: "w", to: "pages" },
      { from: "w", to: "urls", via: ["l", "r"] },
    ],
  },
  parts: {
    lb: {
      why: "Every fetch job passes through the balancer first. It spreads the jobs over the fetchers (in a real crawler, by a hash of the website, so one fetcher owns each site). One small balancer zone carries about 1,600 a second, so three zones carry the 2,700 a second at the busiest hour with room to spare (56% busy).",
      checks: ["capacity", "p99", "fetcher-dies", "seen-dies", "seen-dies-p99"],
      without: "With one zone the balancer is 169% busy. It can pass only 1,600 jobs a second, the slowest 1 in 100 (p99) takes 181 ms, and every fault check fails with it. With two zones it is 84% busy and p99 is 60 ms, over the 55 ms target.",
    },
    fetch: {
      why: "Three fetchers in two zones, so that losing one still leaves two to carry the load (one spare machine, called N+1). Each is 38% busy at the busiest hour, and 56% busy with one gone.",
      checks: ["capacity", "p99", "fetcher-dies", "availability"],
      without: "With two fetchers, losing one leaves room for 2,400 jobs a second out of 2,700, so only 88.8% are fetched, and p99 is already 65 ms at peak. With one fetcher, the ceiling is 2,400 a second (113% busy) and nothing is left when it dies.",
    },
    seen: {
      why: "At a 95% hit rate the seen-URL memory answers 2,565 of the 2,700 questions a second itself. A hit means the URL table is never asked, so only about 135 a second reach it, and the table stays nearly idle.",
      checks: ["p99", "seen-dies", "seen-dies-p99", "availability"],
      without: "With no memory the table is asked all 2,700 questions, is 68% busy, and p99 is 62 ms, over the 55 ms target. Kept in one zone instead of two, the memory is the weak link and availability falls to 99.83%.",
    },
    q: {
      why: "The queue holds each downloaded page until a parser takes it. The fetchers never wait for parsing, and no page is lost while the parsers are away.",
      checks: ["new-links", "parsers-die", "p99"],
      without: "With no queue there are no parsers, so no found link ever reaches the URL table, and 162,000 downloaded pages are lost in the 60 seconds the parsers are away. If the fetchers save pages themselves, p99 rises to 67 ms, over the 55 ms target.",
    },
    w: {
      why: "Two parsers take pages from the queue, save them in object storage, and write the links they found to the URL table in groups of 500 (batches), so the table sees about 5 writes a second instead of 2,700. Two parsers leave 2,100 pages a second to spare, which clears 60 seconds of waiting pages (162,000) in 78 seconds.",
      checks: ["new-links", "parsers-die", "p99", "seen-dies"],
      without: "One parser handles 2,400 pages a second while 2,700 arrive, so the waiting pages never clear. A batch size of 1 sends 2,700 writes a second to the table: p99 is 64 ms, and when the memory dies the table is 135% busy and only 74.0% of pages are fetched (p99 380 ms).",
    },
    urls: {
      why: "The URL table holds every address the crawler knows. In two zones it keeps working if one zone fails. At peak it is only about 4% busy, because the memory answers the rest, and 68% busy if the memory stops.",
      checks: ["record-url", "new-links", "seen-dies", "availability"],
      without: "With no URL table there is nowhere to record an address or add a found link, so both path checks fail. Kept in one zone, the table is the weak link and availability falls to 99.88%, under the 99.9% target.",
    },
    pages: {
      why: "Object storage keeps every page the crawler fetched. It is the biggest bill: each saved page is a paid request, $3.90 of the $5.50 an hour at 2,700 pages a second, whatever else you choose.",
      checks: ["save-page", "cost"],
      without: "With no object storage, nowhere keeps the pages, and the save-page check fails. The bill falls to $1.60 an hour, which shows how much of the cost is saving pages.",
    },
  },
};
