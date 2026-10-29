import type { HldLabSpec } from "../types";
import { ticketDropSolution } from "./solution";

export const hldVisualTicketDrop: HldLabSpec = {
  slug: "hld-visual-ticket-drop",
  family: "hld",
  title: "Design a ticket drop (a flash sale)",
  purpose:
    "Build the system behind a ticket drop from parts, press Run, and see whether it can hold seats, show which seats are free and confirm payments when 8,000 requests a second hit it at ten o'clock, and whether it keeps going when an app server, the seat-map cache or the payment worker dies.",
  limits:
    "A simplified model, not a real cloud. Times are in model milliseconds, the cache is always full of useful answers (warm), and prices are made up to compare designs. The board counts capacity and waiting, not correctness: it cannot show two buyers getting the same seat, because it never looks at which seat a request asks for. About 1 admitted request in 8 becomes a payment (chapter 25.2: half the admitted fans buy and each makes 4 requests), so the queue and the worker see a small share of the traffic. The waiting room shows as over 100% busy because it turns people away on purpose.",
  hints: [
    "Run the starting design first. It can hold a seat, but it cannot show the seat map or confirm a payment, and the load balancer is 500% busy. Read the reasons.",
    "A waiting room (a rate limiter) lets only some of the crowd in and turns the rest away on purpose, so it will show over 100% busy. Set its limit to what the parts behind it can carry. Too high and they choke. Too low and too few buyers get in.",
    "Seat views are most of the traffic. A cache answers them from memory, so the database is asked only on a miss. The database must also carry all the views alone for the minute the cache is gone, which read-only copies (read replicas) make possible.",
    "Only about 1 request in 8 that gets in is a payment. Payments wait in a queue and a worker confirms them. The worker needs spare capacity to clear the payments that piled up while it was away. Saving payments in groups (batch size) protects the database.",
    "Spare machines cost money. Add the extra machine only where a check asks for it.",
  ],
  allowedComponents: ["client", "rate-limiter", "load-balancer", "app-server", "cache", "database", "queue", "worker"],
  startingBoard: {
    nodes: [
      { id: "client", kind: "client", x: 0, y: 0 },
      { id: "lb", kind: "load-balancer", x: 0, y: 1, props: { size: "general-small", zones: 1 } },
      { id: "app", kind: "app-server", x: 0, y: 2, props: { size: "compute-small", count: 1 } },
      { id: "db", kind: "database", x: 0, y: 3, props: { size: "memory-small", readRatio: 0.8 } },
    ],
    edges: [
      { from: "client", to: "lb" },
      { from: "lb", to: "app" },
      { from: "app", to: "db" },
    ],
  },
  scenario:
    "Ten o'clock: 8,000 requests a second hit the door at the busiest moment. Seats must be held, the seat map shown and payments confirmed, and the system must keep answering when a part dies.",
  levels: [{ id: "l1", load: 8_000, targets: { rps: 3_000, p99Ms: 90, availability: 0.999, budgetPerHour: 1.75 } }],
  solution: ticketDropSolution,
  challenge: {
    peakLoad: 8_000,
    shares: { queue: 0.125 },
    scenarios: [
      { id: "lose-app", title: "An app server dies", story: "One app server stops. The load balancer sends its share to the others.", faults: [{ type: "lose-instance", role: "compute" }] },
      { id: "lose-cache", title: "The seat-map cache dies", story: "The cache is gone. Every seat view now asks the database.", faults: [{ type: "down", role: "cache" }] },
      { id: "lose-worker", title: "The payment worker dies", story: "Fans can still hold seats. Payments wait in the queue to be confirmed.", faults: [{ type: "down", role: "worker" }] },
    ],
    checks: [
      { type: "path", id: "hold", kind: "functional", label: "A seat can be held", chain: ["client", "compute", "database"], target: "a hold is saved: client > app server > database" },
      { type: "path", id: "seatmap", kind: "functional", label: "The seat map shows what is free", chain: ["client", "compute", "cache"], target: "the app server can read seat availability from a cache" },
      { type: "path", id: "pay", kind: "functional", label: "A payment is confirmed", chain: ["client", "compute", "queue", "worker", "database"], target: "a payment is confirmed: app server > queue > worker > database" },
      { type: "metric", id: "capacity", kind: "non-functional", label: "Lets in and serves enough buyers", scenario: "steady", metric: "capacity", op: ">=", value: 3_000 },
      { type: "metric", id: "p99", kind: "non-functional", label: "Slowest 1 in 100 requests is fast enough (p99)", scenario: "steady", metric: "p99", op: "<=", value: 90 },
      { type: "metric", id: "app-dies", kind: "non-functional", label: "Buyers are still served when an app server dies", scenario: "lose-app", metric: "capacity", op: ">=", value: 3_000 },
      { type: "metric", id: "app-dies-p99", kind: "non-functional", label: "Slowest 1 in 100 while an app server is down (p99)", scenario: "lose-app", metric: "p99", op: "<=", value: 130 },
      { type: "metric", id: "cache-dies", kind: "non-functional", label: "Slowest 1 in 100 while the cache is down (p99)", scenario: "lose-cache", metric: "p99", op: "<=", value: 110 },
      { type: "drain", id: "worker-dies", kind: "non-functional", label: "No payment is lost when the worker dies", outageSeconds: 60, maxDrainSeconds: 120, items: "payments", done: "confirmed" },
      { type: "metric", id: "availability", kind: "non-functional", label: "Stays up (availability)", scenario: "steady", metric: "availability", op: ">=", value: 0.999 },
      { type: "metric", id: "cost", kind: "non-functional", label: "Cost per hour", scenario: "steady", metric: "cost", op: "<=", value: 1.75 },
    ],
  },
};
