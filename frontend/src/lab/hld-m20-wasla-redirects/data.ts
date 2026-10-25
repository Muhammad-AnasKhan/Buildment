import { kindsInFamily } from "../catalog";
import type { HldLabSpec } from "../types";
import { waslaRedirectsSolution } from "./solution";

export const hldM20WaslaRedirects: HldLabSpec = {
  slug: "hld-m20-wasla-redirects",
  family: "hld",
  title: "Wasla's redirects with cache-aside",
  purpose: "Put a cache in front of Wasla's links store so 100,000 redirects a second never reach the database.",
  limits:
    "A steady-state model, not a real cloud. Latency is in model milliseconds, not the 0.55 ms of chapter 20.4. The cache is always warm here and prices are illustrative.",
  hints: [
    "Link a cache from the app servers. Only cache misses go on to the database.",
    "Each cache node serves about 30,000 requests a second at the default size, so count the nodes as well as the hit rate.",
    "At a 95% hit rate, 5,000 misses a second still reach the database. Give it read replicas or a bigger size.",
  ],
  solution: waslaRedirectsSolution,
  allowedComponents: kindsInFamily("hld"),
  startingBoard: {
    nodes: [
      { id: "client", kind: "client", x: 1, y: 0 },
      { id: "lb1", kind: "load-balancer", x: 0, y: 1, props: { size: "general-xlarge", zones: 3 } },
      { id: "lb2", kind: "load-balancer", x: 1, y: 1, props: { size: "general-xlarge", zones: 3 } },
      { id: "lb3", kind: "load-balancer", x: 2, y: 1, props: { size: "general-xlarge", zones: 3 } },
      { id: "app", kind: "app-server", x: 1, y: 2, props: { count: 50, azs: 2 } },
      { id: "db", kind: "database", x: 1, y: 3, props: { readRatio: 0.99, multiAz: 1 } },
    ],
    edges: [
      { from: "client", to: "lb1" },
      { from: "client", to: "lb2" },
      { from: "client", to: "lb3" },
      { from: "lb1", to: "app" },
      { from: "lb2", to: "app" },
      { from: "lb3", to: "app" },
      { from: "app", to: "db" },
    ],
  },
  scenario:
    "Peak hour: serve 100,000 redirects a second with p99 under 200 ms and 99.9% availability, for under $17 an hour.",
  levels: [
    { id: "l1", load: 100_000, targets: { rps: 100_000, p99Ms: 200, availability: 0.999, budgetPerHour: 17 } },
    { id: "l2", load: 200_000, targets: { rps: 200_000, p99Ms: 200, availability: 0.999, budgetPerHour: 35 } },
    {
      id: "l3",
      load: 100_000,
      targets: { rps: 100_000, p99Ms: 200, availability: 0.999, budgetPerHour: 17 },
      event: "Fail one zone",
    },
  ],
};
