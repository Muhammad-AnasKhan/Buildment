import { kindsInFamily } from "../catalog";
import type { HldLabSpec } from "../types";
import { threeTiersSolution } from "./solution";

export const hldM4ThreeTiers: HldLabSpec = {
  slug: "hld-m4-three-tiers",
  family: "hld",
  title: "Three layers for 10,000 requests a second (a three-tier design)",
  purpose: "Size Daftar's load balancer (the front door that spreads traffic), app machines and database for exam week, then make it survive losing a zone (one data centre).",
  limits:
    "A simplified model, not a real cloud. Times are in model milliseconds, there are no slow starts or noisy neighbours, and prices are made up to compare designs.",
  hints: [
    "The load balancer is a machine too. At the default size it tops out near 1,600 requests a second.",
    "Reads can go to read-only copies (read replicas). Every write still goes to the main copy.",
    "Spread the app servers over two zones, and give the database an extra copy that takes over (a failover standby) in a second zone. Otherwise one bad zone takes Daftar down.",
  ],
  solution: threeTiersSolution,
  allowedComponents: kindsInFamily("hld"),
  startingBoard: {
    nodes: [
      { id: "client", kind: "client", x: 0, y: 0 },
      { id: "lb", kind: "load-balancer", x: 0, y: 1 },
      { id: "app", kind: "app-server", x: 0, y: 2 },
      { id: "db", kind: "database", x: 0, y: 3 },
    ],
    edges: [
      { from: "client", to: "lb" },
      { from: "lb", to: "app" },
      { from: "app", to: "db" },
    ],
  },
  scenario:
    "Exam week: serve 10,000 requests a second with the slowest 1 in 100 requests (p99) under 200 ms and 99.9% uptime (availability), for under $4.50 an hour.",
  levels: [
    { id: "l1", load: 10_000, targets: { rps: 10_000, p99Ms: 200, availability: 0.999, budgetPerHour: 4.5 } },
    { id: "l2", load: 20_000, targets: { rps: 20_000, p99Ms: 200, availability: 0.999, budgetPerHour: 9 } },
    {
      id: "l3",
      load: 20_000,
      targets: { rps: 20_000, p99Ms: 200, availability: 0.999, budgetPerHour: 9 },
      event: "Fail one zone",
    },
  ],
};
