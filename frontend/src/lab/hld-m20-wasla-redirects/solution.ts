import type { SolutionDef } from "../types";

// Recorded in spec.md: ceiling 115,200 a second, p99 171 ms, $15.00 an hour.
export const waslaRedirectsSolution: SolutionDef = {
  summary:
    "A cache in front of the links store answers almost every redirect, so the database sees only the misses. Size the cache for the request rate, and give the database replicas for the misses.",
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
    lb2: { why: "Part of the same balancer layer, so no single balancer is the one failure.", checks: ["capacity", "availability"], without: "One balancer alone is a single point of failure for the whole service." },
    lb3: { why: "The third balancer keeps the layer under the knee at peak.", checks: ["capacity", "p99"], without: "Two balancers carry 50% more each and sit closer to the knee, where waiting time climbs." },
    app: { why: "Fifty app servers in two zones carry 100,000 requests a second and ask the cache first.", checks: ["capacity", "p99", "availability"], without: "Fewer servers put the app tier past the knee, and p99 passes 200 ms." },
    cache: {
      why: "Four cache nodes at a 95% hit rate answer 95,000 of every 100,000 requests. A cache hit means the database is never asked, so only 5,000 a second reach it. One default node serves about 30,000 a second, so four are needed to carry all 100,000 with room.",
      checks: ["capacity", "p99", "cost"],
      without: "Without the cache, one database serves about 2,400 a second against 100,000: the ceiling is 2,424 and p99 is near 700 ms. With three nodes the cache itself caps the design near 90,000.",
    },
    db: {
      why: "The misses, 5,000 a second, still reach the links store. Two read replicas share them, and a standby in a second zone keeps it up.",
      checks: ["capacity", "p99", "availability", "cost"],
      without: "With no replicas the 5,000 misses a second are about twice what one database serves, so it is the busiest part and p99 stays near 680 ms.",
    },
  },
};
