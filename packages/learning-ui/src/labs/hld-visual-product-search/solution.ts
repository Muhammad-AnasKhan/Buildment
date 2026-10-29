import type { SolutionDef } from "../types";

// The reference design recorded in spec.md: 12 of 12 checks at $2.45 an hour.
export const productSearchSolution: SolutionDef = {
  summary:
    "Give the search index the most room, because it is the biggest bill: eight small nodes, so that losing one costs an eighth. Put a cache in front of the product database for suggestions, and send the few product changes through a queue to a worker, so a dead worker loses nothing.",
  board: {
    nodes: [
      { id: "client", kind: "client", x: 1, y: 0 },
      { id: "lb", kind: "load-balancer", x: 1, y: 1, props: { size: "general-small", zones: 3 } },
      { id: "app", kind: "app-server", x: 1, y: 2, props: { size: "compute-small", count: 3, azs: 2 } },
      { id: "cache", kind: "cache", x: 0, y: 3, props: { size: "memory-small", count: 1, hitRate: 0.9, azs: 2 } },
      { id: "search", kind: "search", x: 1, y: 3, props: { size: "memory-small", count: 8, azs: 2 } },
      { id: "q", kind: "queue", x: 2, y: 3 },
      { id: "db", kind: "database", x: 0, y: 4, props: { size: "memory-small", readRatio: 0.95, multiAz: 1 } },
      { id: "w", kind: "worker", x: 2, y: 4, props: { size: "compute-small", count: 1 } },
    ],
    edges: [
      { from: "client", to: "lb" },
      { from: "lb", to: "app" },
      { from: "app", to: "cache" },
      { from: "app", to: "search" },
      { from: "app", to: "db" },
      { from: "app", to: "q" },
      { from: "q", to: "w" },
      { from: "w", to: "search", via: ["b", "r"] },
    ],
  },
  parts: {
    lb: {
      why: "Every lookup passes through the load balancer first. One small balancer zone carries about 1,600 requests a second, so three zones carry the 3,000 a second at the busiest moment (63% busy).",
      checks: ["capacity", "p99", "app-dies", "search-dies", "search-dies-p99", "availability"],
      without: "With two zones the balancer is 94% busy: the slowest 1 in 100 (p99) takes 146 ms, over the 130 ms target, and 170 ms with a search node down. With one zone it is 188% busy, it can serve only 1,600 requests a second, p99 is 247 ms, and uptime (availability) falls to 99.88%.",
    },
    app: {
      why: "Three app servers in two zones, each able to carry 2,400 requests a second. At the busiest moment each is 42% busy. When one dies, the other two are 63% busy and everyone is still served (one spare machine, called N+1).",
      checks: ["capacity", "p99", "app-dies", "availability"],
      without: "With two app servers, losing one leaves 2,400 requests a second for 3,000, so only 80% are served. At the busiest moment the two are already 63% busy and p99 is 138 ms, over the target. With one server, nothing is left when it dies. Three servers in one zone fall to 99.93% availability, under the 99.95% target.",
    },
    cache: {
      why: "The cache answers suggestions from memory, and 90% of product lookups too. A hit means the product database is never asked, so only about 300 of the 3,000 lookups a second reach it.",
      checks: ["suggest", "capacity", "p99", "app-dies", "search-dies", "search-dies-p99"],
      without: "With no cache, a suggestion has nowhere to be served from, and the product database does all 3,000 lookups: it is 238% busy, the whole design can serve only 1,263 a second, and p99 is 583 ms. A cache in one zone gives 99.83% availability.",
    },
    search: {
      why: "Eight small search nodes hold the index. They answer the 3,000 lookups a second and take about 75 product changes a second from the worker, so they carry about 3,075 a second in all, 64% busy. Losing one node leaves seven at 73%.",
      checks: ["search", "index-update", "capacity", "p99", "search-dies", "search-dies-p99"],
      without: "With seven nodes the index is 73% busy at the busiest moment (p99 143 ms, over the 130 ms target) and 85% busy after a loss (p99 221 ms, over 160 ms). With six nodes a loss leaves it at 102%, so only 97.5% are served. Four medium nodes cost the same as eight small ones, but losing one leaves the rest at 85% and p99 at 221 ms.",
    },
    q: {
      why: "The queue holds each product change until the worker indexes it. About 1 lookup in 40 comes with a change. The seller's save never waits for the index, and no change is lost while the worker is away.",
      checks: ["index-update", "indexer-dies"],
      without: "With no queue, a product change has no path to the index, and every change made while the worker is away is lost (22,500 changes in a 5 minute outage). The design looks cheaper ($2.31 an hour) and nearly as fast, which is why a missing job is easy to miss.",
    },
    w: {
      why: "One worker takes changes from the queue and writes them to the index. It handles 2,400 a second against 75 arriving, so it has 2,325 a second to spare. After a 5 minute outage, the 22,500 waiting changes are all indexed within 10 seconds of its return.",
      checks: ["index-update", "indexer-dies"],
      without: "With a queue and no worker, nothing ever takes the changes out, and they pile up and are never indexed. A second worker clears the backlog in 5 seconds but costs $0.12 an hour more, which puts the design over its $2.50 budget.",
    },
    db: {
      why: "The product database keeps every product and is the source of truth: the index can always be rebuilt from it. An extra copy in a second zone takes over if the main one's zone fails (a failover standby).",
      checks: ["details", "availability"],
      without: "With no database, results cannot show full product details. With no extra copy that takes over, the database is the weak link and availability falls to 99.83%, under the 99.95% target.",
    },
  },
};
