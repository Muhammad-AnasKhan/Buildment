import type { SolutionDef } from "../types";

// Recorded in spec.md: ceiling 12,000 a second, p99 109 ms, above 99.99% available, $3.56 an hour.
export const threeTiersSolution: SolutionDef = {
  summary:
    "Size every part on the path, not just the app machines: a large load balancer in two zones, eight app servers in two zones, and a large database with a read-only copy and an extra copy that takes over.",
  board: {
    nodes: [
      { id: "client", kind: "client", x: 0, y: 0 },
      { id: "lb", kind: "load-balancer", x: 0, y: 1, props: { size: "general-large", zones: 2 } },
      { id: "app", kind: "app-server", x: 0, y: 2, props: { size: "compute-small", count: 8, azs: 2 } },
      { id: "db", kind: "database", x: 0, y: 3, props: { size: "memory-large", replicas: 1, multiAz: 1 } },
    ],
    edges: [
      { from: "client", to: "lb" },
      { from: "lb", to: "app" },
      { from: "app", to: "db" },
    ],
  },
  parts: {
    lb: {
      why: "The load balancer is a machine too, and every request passes through it. A small one tops out near 1,600 requests a second, so a large one in two zones carries the 10,000 a second.",
      checks: ["capacity", "p99", "availability"],
      without: "A small balancer caps the whole design at 1,600 requests a second however many app servers sit behind it, and the slowest 1 in 100 requests (p99) passes the 200 ms target.",
    },
    app: {
      why: "Eight app servers in two zones stay below 70% busy (the point where waiting climbs), and spread over two zones so one bad zone still leaves four.",
      checks: ["capacity", "p99", "availability"],
      without: "With the default two servers the app tier is the busiest part and the slowest 1 in 100 requests passes 200 ms. In one zone, a zone outage takes every server at once.",
    },
    db: {
      why: "A large database with one read-only copy (a read replica) serves the 80% of requests that only read. An extra copy in a second zone takes over if the main one's zone fails (a failover standby).",
      checks: ["capacity", "p99", "availability", "cost"],
      without: "Without the extra copy, uptime (availability) falls to 99.85%, under the 99.9% target, while cost falls by $0.60 an hour. With a medium database and no help, the most it can serve drops to 6,000 a second.",
    },
  },
};
