import type { HldLabSpec } from "../types";
import { rideMatchingSolution } from "./solution";

export const hldVisualRideMatching: HldLabSpec = {
  slug: "hld-visual-ride-matching",
  family: "hld",
  title: "Design a ride service that finds nearby drivers (ride matching)",
  purpose:
    "Build Safar's ride service from parts, press Run, and see whether it stores where drivers are, finds the ones near a rider, saves trips, and keeps going when an app server, a node of the location map or the trip worker dies.",
  limits:
    "A simplified model, not a real city. Times are in model milliseconds, the location map is always full of fresh places (warm), traffic is spread evenly over the parts, and prices are made up to compare designs. The board cannot show a crowded box (a stadium after a match), places going stale, or reports arriving out of order. The code lab for this design is coming.",
  hints: [
    "Run the starting design first. It has no place to keep where the drivers are, so read which checks fail and why.",
    "Driver phones report their place far more often than riders ask for a ride. A fast in-memory store (a cache) holding each driver's latest place answers most requests, and only the rest (ride requests and trips) reach the database.",
    "Only about 1 request in 200 leaves a trip event (a ride is requested, offered, accepted). A queue and a worker record those events off the request path, so a stopped worker loses nothing and costs the request no time.",
    "Spare machines cost money. Add the extra machine only where a check asks for it.",
  ],
  allowedComponents: ["client", "load-balancer", "app-server", "cache", "database", "queue", "worker"],
  startingBoard: {
    nodes: [
      { id: "client", kind: "client", x: 0, y: 0 },
      { id: "lb", kind: "load-balancer", x: 0, y: 1, props: { size: "general-small", zones: 1 } },
      { id: "app", kind: "app-server", x: 0, y: 2, props: { size: "compute-small", count: 1 } },
      { id: "db", kind: "database", x: 0, y: 3, props: { size: "memory-medium", readRatio: 0.5 } },
    ],
    edges: [
      { from: "client", to: "lb" },
      { from: "lb", to: "app" },
      { from: "app", to: "db" },
    ],
  },
  scenario:
    "A busy evening in Safar's first city: 4,000 requests a second at the busiest moment, mostly drivers' phones reporting where they are. Riders search for cars nearby, and about 1 request in 200 is a trip event from a ride being requested, offered or accepted. Places must be stored, nearby drivers found and trips saved, and the service must keep answering when a part dies.",
  levels: [
    { id: "l1", load: 4_000, targets: { rps: 4_000, p99Ms: 72, availability: 0.999, budgetPerHour: 1.65 } },
  ],
  solution: rideMatchingSolution,
  challenge: {
    peakLoad: 4_000,
    shares: { queue: 0.005 },
    scenarios: [
      { id: "lose-app", title: "An app server dies", story: "One app server stops. The load balancer sends its share to the others.", faults: [{ type: "lose-instance", role: "compute" }] },
      { id: "lose-map", title: "A node of the location map dies", story: "One node of the map stops and forgets its drivers. They report again within 4 seconds. A map with one node has nothing left.", faults: [{ type: "lose-instance", role: "cache" }] },
      { id: "lose-worker", title: "The trip worker dies", story: "Searches and updates carry on. Trip events wait in the queue to be saved.", faults: [{ type: "down", role: "worker" }] },
    ],
    checks: [
      { type: "path", id: "places", kind: "functional", label: "Drivers' places are stored and searched", chain: ["client", "compute", "cache"], target: "a driver's latest place is kept and read back from the location map: client > app server > cache" },
      { type: "path", id: "trip", kind: "functional", label: "A ride request becomes a saved trip", chain: ["client", "compute", "database"], target: "the app server can save a trip in the database: client > app server > database" },
      { type: "path", id: "events", kind: "functional", label: "Trip events are recorded", chain: ["client", "compute", "queue", "worker", "database"], target: "a trip event is saved off the request path: app server > queue > worker > database" },
      { type: "metric", id: "capacity", kind: "non-functional", label: "Serves the whole peak", scenario: "steady", metric: "capacity", op: ">=", value: 4_000 },
      { type: "metric", id: "p99", kind: "non-functional", label: "Slowest 1 in 100 requests is fast enough (p99)", scenario: "steady", metric: "p99", op: "<=", value: 72 },
      { type: "metric", id: "app-dies", kind: "non-functional", label: "Everyone is still served when one app server dies", scenario: "lose-app", metric: "served", op: ">=", value: 0.999 },
      { type: "metric", id: "map-dies", kind: "non-functional", label: "Everyone is still served when a map node dies", scenario: "lose-map", metric: "served", op: ">=", value: 0.999 },
      { type: "metric", id: "map-dies-p99", kind: "non-functional", label: "Slowest 1 in 100 while a map node is down (p99)", scenario: "lose-map", metric: "p99", op: "<=", value: 100 },
      { type: "drain", id: "worker-dies", kind: "non-functional", label: "No trip events are lost when the worker dies", outageSeconds: 60, maxDrainSeconds: 30, items: "trip events", done: "saved" },
      { type: "metric", id: "availability", kind: "non-functional", label: "Stays up (availability)", scenario: "steady", metric: "availability", op: ">=", value: 0.999 },
      { type: "metric", id: "cost", kind: "non-functional", label: "Cost per hour", scenario: "steady", metric: "cost", op: "<=", value: 1.65 },
    ],
  },
};
