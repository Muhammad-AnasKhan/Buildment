import { kindsInFamily } from "../catalog";
import type { HldLabSpec } from "../types";

export const linuxSingleHost: HldLabSpec = {
  slug: "linux-single-host",
  family: "hld",
  title: "One Linux host",
  purpose: "Put nginx, an app service and PostgreSQL on hosts and see which one runs out of cores.",
  limits: "Cores are the only resource modelled. No memory, disk I/O, file descriptors or kernel tuning yet.",
  hints: ["Move PostgreSQL to its own bigger host before adding app hosts."],
  allowedComponents: ["client", ...kindsInFamily("linux")],
  startingBoard: {
    nodes: [
      { id: "client", kind: "client", x: 0, y: 0 },
      { id: "nginx", kind: "linux-nginx", x: 0, y: 1 },
      { id: "app", kind: "linux-service", x: 0, y: 2 },
      { id: "db", kind: "linux-postgres", x: 0, y: 3 },
    ],
    edges: [
      { from: "client", to: "nginx" },
      { from: "nginx", to: "app" },
      { from: "app", to: "db" },
    ],
  },
  scenario: "Serve 1,000 req/s at p99 under 200 ms.",
  levels: [{ id: "l1", load: 1000, targets: { rps: 1000, p99Ms: 200, availability: 0.95 } }],
};
