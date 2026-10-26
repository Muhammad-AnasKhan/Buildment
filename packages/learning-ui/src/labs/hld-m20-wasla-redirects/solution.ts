import type { SolutionDef } from "../types";

// Recorded in spec.md: ceiling 115,200 a second, p99 171 ms, $15.00 an hour.
export const waslaRedirectsSolution: SolutionDef = {
  summary:
    "A cache in front of the links store answers almost every redirect from memory, so the database only sees what the cache did not have. Size the cache for the request rate, and give the database read-only copies for the rest.",
  board: {
    nodes: [
      { id: "client", kind: "client", x: 1, y: 0 },
      { id: "lb1", kind: "load-balancer", x: 0, y: 1, props: { size: "general-xlarge", zones: 3 } },
      { id: "lb2", kind: "load-balancer", x: 1, y: 1, props: { size: "general-xlarge", zones: 3 } },
      { id: "lb3", kind: "load-balancer", x: 2, y: 1, props: { size: "general-xlarge", zones: 3 } },
      { id: "app", kind: "app-server", x: 1, y: 2, props: { count: 50, azs: 2 } },
      { id: "cache", kind: "cache", x: 0, y: 3, props: { count: 4, hitRate: 0.95 } },
      { id: "db", kind: "database", x: 1, y: 3, props: { readRatio: 0.99, multiAz: 1, replicas: 2 } },
    ],
    edges: [
      { from: "client", to: "lb1" },
      { from: "client", to: "lb2" },
      { from: "client", to: "lb3" },
      { from: "lb1", to: "app" },
      { from: "lb2", to: "app" },
      { from: "lb3", to: "app" },
      { from: "app", to: "cache" },
      { from: "app", to: "db" },
    ],
  },
  parts: {
    lb1: { why: "Three extra-large balancers, each in three zones, carry 100,000 requests a second.", checks: ["capacity", "availability"], without: "Fewer or smaller balancers become the busiest part before the cache is ever reached." },
    lb2: { why: "Part of the same layer of balancers, so no single balancer is the one thing that can fail.", checks: ["capacity", "availability"], without: "One balancer alone would stop the whole service if it failed." },
    lb3: { why: "The third balancer keeps the layer below the point where waiting climbs, at the busiest moment.", checks: ["capacity", "p99"], without: "Two balancers carry half as much again each and sit closer to the point where waiting climbs." },
    app: { why: "Fifty app servers in two zones carry 100,000 requests a second and ask the cache first.", checks: ["capacity", "p99", "availability"], without: "Fewer servers push the app tier past the point where waiting climbs, and the slowest 1 in 100 requests (p99) passes 200 ms." },
    cache: {
      why: "Four cache machines at a 95% hit rate answer 95,000 of every 100,000 requests. A cache hit (the answer was there) means the database is never asked, so only 5,000 a second reach it. One default machine serves about 30,000 a second, so four are needed to carry all 100,000 with room to spare.",
      checks: ["capacity", "p99", "cost"],
      without: "Without the cache, one database serves about 2,400 a second against 100,000: the most it can serve is 2,424 and the slowest 1 in 100 takes nearly 700 ms. With three cache machines, the cache itself caps the design near 90,000.",
    },
    db: {
      why: "The 5,000 misses a second still reach the links store. Two read-only copies (read replicas) share them, and an extra copy in a second zone takes over if the main one's zone fails.",
      checks: ["capacity", "p99", "availability", "cost"],
      without: "With no read-only copies, 5,000 misses a second is about twice what one database serves, so it is the busiest part and the slowest 1 in 100 requests still takes about 680 ms.",
    },
  },
};
