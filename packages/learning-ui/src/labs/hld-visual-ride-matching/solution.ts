import type { SolutionDef } from "../types";

// The reference design recorded in spec.md: 11 of 11 checks at $1.49 an hour.
export const rideMatchingSolution: SolutionDef = {
  summary:
    "Keep each driver's latest place in a small in-memory map split over two nodes, so a place report never touches the database. Let trips go to a database with a standby copy, and record the few trip events (about 1 request in 200) off the request path with a queue and one worker.",
  board: {
    nodes: [
      { id: "client", kind: "client", x: 1, y: 0 },
      { id: "lb", kind: "load-balancer", x: 1, y: 1, props: { size: "general-medium", zones: 2 } },
      { id: "app", kind: "app-server", x: 1, y: 2, props: { size: "compute-small", count: 3, azs: 2 } },
      { id: "cache", kind: "cache", x: 0, y: 3, props: { size: "memory-small", count: 2, hitRate: 0.95, azs: 2 } },
      { id: "q", kind: "queue", x: 2, y: 3 },
      { id: "db", kind: "database", x: 1, y: 4, props: { size: "memory-small", replicas: 0, readRatio: 0.5, multiAz: 1 } },
      { id: "w", kind: "worker", x: 2, y: 4, props: { size: "compute-small", count: 1, batchSize: 1 } },
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
      why: "Every request passes through the load balancer first. One medium zone carries about 3,200 requests a second, so two zones carry the 4,000 a second at the busiest moment and are 63% busy.",
      checks: ["capacity", "p99", "app-dies", "map-dies", "map-dies-p99", "availability"],
      without: "With one medium zone the balancer is 125% busy. It serves only 3,200 requests a second, the slowest 1 in 100 requests (p99) takes 197 ms, and the app-server and map-node checks fail with only 80% served. Three small zones carry the load but are 83% busy, and p99 is 76 ms, over the 72 ms target.",
    },
    app: {
      why: "Three app servers in two zones, so that losing one still leaves two to carry the load (one spare machine, called N+1). Each is 56% busy at the busiest moment, and 83% busy with one gone.",
      checks: ["capacity", "p99", "app-dies", "availability"],
      without: "With two servers each is already 83% busy, p99 is 144 ms, and losing one leaves room for 2,400 requests a second out of 4,000, so only 60% are served. With one server, nothing is left when it dies.",
    },
    cache: {
      why: "The map holds each driver's latest place, split over two nodes. Reports and searches are answered from memory, so at a 95% hit rate only about 200 of the 4,000 requests a second (ride requests and trips) reach the database. If one node stops, the other keeps serving, and the lost drivers report again within 4 seconds.",
      checks: ["places", "capacity", "p99", "app-dies", "map-dies", "map-dies-p99"],
      without: "With no map, the small database takes all 4,000 requests a second and is 168% busy: it serves 2,388 a second and p99 is 594 ms. With a map of one node, it is fine until that node stops. Then the database is 168% busy, only 59.7% are served and p99 is 594 ms. A larger database (memory-large with a standby) would pass, but at $2.24 an hour, over the $1.65 budget.",
    },
    q: {
      why: "About 1 request in 200 leaves a trip event (a ride is requested, offered or accepted), which is 20 events a second. The queue holds each one until a worker saves it, so the request never waits for the save, and no event is lost while the worker is away. It costs about a cent an hour.",
      checks: ["events", "worker-dies"],
      without: "With no queue, trip events have nowhere to wait while the worker is down, and the events check fails because the path stops at the app server. The design costs $1.36 an hour and fails 2 of the 11 checks.",
    },
    w: {
      why: "One worker takes the 20 events a second from the queue and saves them in the database. It handles 2,400 a second, so it is 1% busy. If it stops for 60 seconds, 1,200 events wait, and the worker clears them in about 1 second after it returns.",
      checks: ["events", "worker-dies"],
      without: "With a queue and no worker, nothing saves the events: they pile up and are never saved, and the events and worker checks both fail. A second worker passes too, but adds $0.12 an hour for no gain.",
    },
    db: {
      why: "The database keeps trips. An extra copy in a second zone takes over if the main one's zone fails (a failover standby). It is only 9% busy, because the map and the small share of trip events keep almost everything away from it.",
      checks: ["trip", "availability", "events"],
      without: "With no standby the database is the weak link and uptime (availability) falls to about 99.84%, under the 99.9% target. A medium database in place of the small one adds cost and no passing check: $1.79 an hour, over the $1.65 budget.",
    },
  },
};
