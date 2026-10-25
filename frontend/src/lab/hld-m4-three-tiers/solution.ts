import type { SolutionDef } from "../types";

// Recorded in spec.md: ceiling 12,000 a second, p99 109 ms, above 99.99% available, $3.56 an hour.
export const threeTiersSolution: SolutionDef = {
  summary:
    "Size every part on the path, not just the app tier: a large balancer in two zones, eight app servers in two zones, and a large database with a replica and a standby.",
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
      why: "The load balancer is a server too, and every request passes through it. A small one tops out near 1,600 a second, so a large one in two zones carries the 10,000 a second.",
      checks: ["capacity", "p99", "availability"],
      without: "A small balancer caps the whole design at 1,600 a second however many app servers sit behind it, and p99 passes the 200 ms target.",
    },
    app: {
      why: "Eight app servers in two zones carry the load below the 70% knee, and spread over two zones so one bad zone leaves four.",
      checks: ["capacity", "p99", "availability"],
      without: "With the default two servers the app tier is the busiest part and p99 climbs far past 200 ms. In one zone, a zone outage takes every server at once.",
    },
    db: {
      why: "A large database with one read replica serves the 80% of traffic that is reads, and a standby in a second zone keeps it up if its zone fails.",
      checks: ["capacity", "p99", "availability", "cost"],
      without: "Without the standby, availability falls to 99.85%, under the 99.9% target, while cost falls by $0.60 an hour. With a medium database and no help, the ceiling drops to 6,000 a second.",
    },
  },
};
