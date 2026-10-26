import type { SolutionDef } from "../types";

// The reference design recorded in spec.md: 11 of 11 checks at $2.39 an hour.
export const urlShortenerSolution: SolutionDef = {
  summary:
    "Spread the work over enough small parts that losing any one still leaves room: three load balancer zones, three app servers, a cache with a read-only copy of the database behind it, and clicks saved off the redirect by a queue and two workers that save in groups.",
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
      why: "Every request passes through the load balancer first. It spreads requests over the app servers. One small balancer zone carries about 1,600 requests a second, so three zones carry the 3,000 a second at the busiest moment with room to spare.",
      checks: ["capacity", "p99", "app-dies", "cache-dies", "cache-dies-p99"],
      without: "With one zone the balancer is 188% busy. It can serve only 1,600 requests a second, the slowest 1 in 100 requests (p99) takes 186 ms, and every failure check fails because it is already past its limit.",
    },
    app: {
      why: "Three app servers in two zones, so that losing one still leaves two to carry the load (one spare machine, called N+1). Each is 42% busy at the busiest moment, and 63% busy with one gone.",
      checks: ["capacity", "p99", "app-dies", "availability"],
      without: "With two servers, losing one leaves room for 2,400 requests a second out of 3,000, so only 80% are served and the slowest 1 in 100 takes over 1,300 ms. With one server, nothing is left.",
    },
    cache: {
      why: "At a 95% hit rate the cache answers 2,850 of the 3,000 lookups a second itself. A cache hit (the answer was there) means the database is never asked, so only about 150 a second reach it.",
      checks: ["p99", "cache-dies", "cache-dies-p99"],
      without: "With no cache the database does all 3,000 lookups, is 62% busy, and the slowest 1 in 100 takes 71 ms, over the 65 ms target. When this cache stops, the database must do them all, which is what the cache-dies checks test.",
    },
    q: {
      why: "The queue holds each click until a worker saves it. The redirect never waits for the count, and no click is lost while the worker is away.",
      checks: ["count", "worker-dies", "capacity", "p99"],
      without: "With no queue, every redirect saves its click in the database first (inline): 3,000 extra saves a second on the main copy. It can then serve only about 2,400 a second and the slowest 1 in 100 takes about 580 ms, unless the database is much bigger. Then it costs $4.41 an hour.",
    },
    w: {
      why: "Two workers take clicks from the queue and save them in groups of 500 (batches), so the database sees about 6 saves a second instead of 3,000. Two workers leave room for 1,800 extra clicks a second, which clears 60 seconds of waiting clicks (180,000) in 100 seconds.",
      checks: ["count", "worker-dies", "p99"],
      without: "One worker handles 2,400 clicks a second while 3,000 arrive, so the waiting clicks never clear. A batch size of 1 sends 3,000 saves a second to the database, and the cache-dies checks fail too.",
    },
    db: {
      why: "The database keeps every link and its click count. An extra copy in a second zone takes over if the main one's zone fails (a failover standby). One read-only copy (a read replica) shares the lookups, so the database can carry all 3,000 a second if the cache stops (62% busy).",
      checks: ["availability", "cache-dies", "cache-dies-p99", "redirect"],
      without: "With no read-only copy, a stopped cache puts the database at 124% busy: 81% of requests are served and the slowest 1 in 100 takes 583 ms. With no extra copy that takes over, the database is the weak link and uptime (availability) falls to about 99.85%, under the 99.9% target.",
    },
  },
};
