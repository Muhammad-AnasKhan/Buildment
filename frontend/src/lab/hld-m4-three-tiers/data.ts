import { kindsInFamily } from "../catalog";
import type { HldLabSpec } from "../types";
import { threeTiersSolution } from "./solution";

export const hldM4ThreeTiers: HldLabSpec = {
  slug: "hld-m4-three-tiers",
  family: "hld",
  title: "Three tiers at 10,000 requests a second",
  purpose: "Size Daftar's load balancer, app tier and database for exam week, then make it survive losing a zone.",
  limits:
    "A steady-state model, not a real cloud. Latency is in model milliseconds, there are no cold starts or noisy neighbours, and prices are illustrative.",
  hints: [
    "The load balancer is a server too. At the default size it tops out near 1,600 requests a second.",
    "Reads can go to read replicas; every write still lands on the primary.",
    "Spread the app servers over two zones and give the database a standby in a second zone, or one bad zone takes Daftar down.",
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
    "Exam week: serve 10,000 requests a second with p99 under 200 ms and 99.9% availability, for under $4.50 an hour.",
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
