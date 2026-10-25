import type { HldLabSpec } from "../types";

export const hldVisualUrlShortener: HldLabSpec = {
  slug: "hld-visual-url-shortener",
  family: "hld",
  title: "Design a URL shortener",
  purpose:
    "Build a short-link service from parts, press Run, and see whether it shortens, redirects and counts clicks, and whether it keeps doing so when a server, the cache or the click worker dies.",
  limits:
    "A steady-state model, not a real cloud. Latency is in model milliseconds, the cache is always warm, and prices are illustrative. The code lab measures the real thing on your laptop.",
  hints: [
    "Run the starting design first. It shortens and redirects, but read which checks fail and why.",
    "A cache in front of the database answers most redirects. Without it, the database carries every one, and when the cache dies it carries them all at once.",
    "Count clicks after the redirect, not during it: app server to queue, queue to worker, worker to database. Set the worker's batch size so the database sees a few writes, not thousands.",
    "Redundancy costs money. Add the second instance only where a check asks for it.",
  ],
  allowedComponents: ["client", "load-balancer", "app-server", "cache", "database", "queue", "worker"],
  startingBoard: {
    nodes: [
      { id: "client", kind: "client", x: 0, y: 0 },
      { id: "lb", kind: "load-balancer", x: 0, y: 1, props: { size: "general-small", zones: 1 } },
      { id: "app", kind: "app-server", x: 0, y: 2, props: { size: "compute-small", count: 1 } },
      { id: "db", kind: "database", x: 0, y: 3, props: { size: "memory-medium", readRatio: 0.99 } },
    ],
    edges: [
      { from: "client", to: "lb" },
      { from: "lb", to: "app" },
      { from: "app", to: "db" },
    ],
  },
  scenario:
    "Launch week: 3,000 redirects a second at the busiest moment. Short links must be made, opened and counted, and the service must keep answering when a part dies.",
  levels: [
    { id: "l1", load: 3_000, targets: { rps: 3_000, p99Ms: 65, availability: 0.999, budgetPerHour: 2.5 } },
  ],
  challenge: {
    peakLoad: 3_000,
    scenarios: [
      { id: "lose-app", title: "An app server dies", story: "One app server stops. The load balancer sends its share to the others.", faults: [{ type: "lose-instance", role: "compute" }] },
      { id: "lose-cache", title: "The cache dies", story: "The cache is gone. Every redirect now asks the database.", faults: [{ type: "down", role: "cache" }] },
      { id: "lose-worker", title: "The click worker dies", story: "Redirects carry on. Clicks wait in the queue to be counted.", faults: [{ type: "down", role: "worker" }] },
    ],
    checks: [
      { type: "path", id: "shorten", kind: "functional", label: "Shortening works", chain: ["client", "compute", "database"], target: "a new link can be saved: client > app server > database" },
      { type: "path", id: "redirect", kind: "functional", label: "A redirect returns the long URL", chain: ["client", "compute", "database"], target: "the app server can read the link back from the database (the cache is optional)" },
      { type: "path", id: "count", kind: "functional", label: "Clicks are counted", chain: ["client", "compute", "queue", "worker", "database"], target: "a click travels app server > queue > worker > database" },
      { type: "metric", id: "capacity", kind: "non-functional", label: "Serves the whole peak", scenario: "steady", metric: "capacity", op: ">=", value: 3_000 },
      { type: "metric", id: "p99", kind: "non-functional", label: "p99 redirect latency", scenario: "steady", metric: "p99", op: "<=", value: 65 },
      { type: "metric", id: "app-dies", kind: "non-functional", label: "Everyone is still served when an app server dies", scenario: "lose-app", metric: "served", op: ">=", value: 0.999 },
      { type: "metric", id: "cache-dies", kind: "non-functional", label: "Everyone is still served when the cache dies", scenario: "lose-cache", metric: "served", op: ">=", value: 0.999 },
      { type: "metric", id: "cache-dies-p99", kind: "non-functional", label: "p99 while the cache is down", scenario: "lose-cache", metric: "p99", op: "<=", value: 100 },
      { type: "drain", id: "worker-dies", kind: "non-functional", label: "No clicks are lost when the worker dies", outageSeconds: 60, maxDrainSeconds: 120 },
      { type: "metric", id: "availability", kind: "non-functional", label: "Availability", scenario: "steady", metric: "availability", op: ">=", value: 0.999 },
      { type: "metric", id: "cost", kind: "non-functional", label: "Cost per hour", scenario: "steady", metric: "cost", op: "<=", value: 2.5 },
    ],
  },
};
