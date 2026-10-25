import type { SolutionDef } from "../types";

// The reference design recorded in spec.md: 11 of 11 checks at $2.39 an hour.
export const urlShortenerSolution: SolutionDef = {
  summary:
    "Spread the load over enough small parts that losing any one still leaves room: three balancer zones, three app servers, a cache with a replica behind it, and clicks counted off the redirect by a queue and two batching workers.",
  board: {
    nodes: [
      { id: "client", kind: "client", x: 1, y: 0 },
      { id: "lb", kind: "load-balancer", x: 1, y: 1, props: { size: "general-small", zones: 3 } },
      { id: "app", kind: "app-server", x: 1, y: 2, props: { size: "compute-small", count: 3, azs: 2 } },
      { id: "cache", kind: "cache", x: 0, y: 3, props: { size: "memory-small", count: 1, hitRate: 0.95, azs: 2 } },
      { id: "q", kind: "queue", x: 2, y: 3 },
      { id: "db", kind: "database", x: 1, y: 4, props: { size: "memory-medium", replicas: 1, readRatio: 0.99, multiAz: 1 } },
      { id: "w", kind: "worker", x: 2, y: 4, props: { size: "compute-small", count: 2, batchSize: 500 } },
    ],
    edges: [
      { from: "client", to: "lb" },
      { from: "lb", to: "app" },
      { from: "app", to: "cache" },
      { from: "app", to: "db" },
      { from: "app", to: "q" },
      { from: "q", to: "w" },
      { from: "w", to: "db", via: ["l", "r"] },
    ],
  },
  parts: {
    lb: {
      why: "Every request passes through the load balancer first. One small balancer zone carries about 1,600 requests a second, so three zones carry the 3,000 a second at peak with room to spare.",
      checks: ["capacity", "p99", "app-dies", "cache-dies", "cache-dies-p99"],
      without: "With one zone the balancer is 188% busy: capacity 1,600 a second, p99 186 ms, and every fault check fails because the balancer is already past its limit.",
    },
    app: {
      why: "Three app servers in two zones, so that losing one still leaves two to carry the load (N+1). Each carries 42% of its capacity at peak and 63% with one gone.",
      checks: ["capacity", "p99", "app-dies", "availability"],
      without: "With two servers, losing one leaves 2,400 a second for 3,000: only 80% of requests are served and p99 passes 1,300 ms. With one server, nothing is left.",
    },
    cache: {
      why: "At a 95% hit rate the cache answers 2,850 of 3,000 reads a second itself. A cache hit means the database is never asked, so only about 150 a second reach it.",
      checks: ["p99", "cache-dies", "cache-dies-p99"],
      without: "With no cache the database carries all 3,000 reads, sits at 62% busy and p99 is 71 ms, over the 65 ms target. When this cache dies, the database must carry them all, which is what the cache-dies checks test.",
    },
    q: {
      why: "The queue holds each click until a worker counts it, so the redirect never waits for a count and no click is lost while the worker is down.",
      checks: ["count", "worker-dies", "capacity", "p99"],
      without: "With no queue, every redirect writes its click to the database first: 3,000 extra writes a second on the primary. Capacity falls to about 2,400 a second and p99 to about 580 ms, unless the database is much bigger, and then cost is $4.41 an hour.",
    },
    w: {
      why: "Two workers take clicks from the queue and write them in batches of 500, so the database sees about 6 writes a second instead of 3,000. Two workers leave 1,800 clicks a second to spare, which drains 60 seconds of waiting clicks (180,000) in 100 seconds.",
      checks: ["count", "worker-dies", "p99"],
      without: "One worker handles 2,400 clicks a second against 3,000 arriving, so a backlog never drains. A batch size of 1 sends 3,000 writes a second to the database, and the cache-dies checks fail too.",
    },
    db: {
      why: "The database keeps every link and its click count. A standby in a second zone keeps it up if its zone fails, and one read replica shares the reads, so it can carry all 3,000 a second if the cache dies (62% busy).",
      checks: ["availability", "cache-dies", "cache-dies-p99", "redirect"],
      without: "With no replica, the cache dying puts the database at 124% busy: 81% served and p99 583 ms. With no standby, the database is the weak link and availability falls to about 99.85%, under the 99.9% target.",
    },
  },
};
