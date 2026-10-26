import { kindsInFamily } from "../catalog";
import type { HldLabSpec } from "../types";

export const dockerComposeStack: HldLabSpec = {
  slug: "docker-compose-stack",
  family: "hld",
  title: "A Compose stack",
  purpose: "Run a proxy, app containers and Postgres, and find which container limit bites first.",
  limits: "One machine assumed. CPU limits are --cpus values; no memory pressure, disk or network limits are modelled.",
  hints: ["Scale the app with replicas before raising its --cpus limit."],
  allowedComponents: ["client", ...kindsInFamily("docker")],
  startingBoard: {
    nodes: [
      { id: "client", kind: "client", x: 0, y: 0 },
      { id: "proxy", kind: "docker-proxy", x: 0, y: 1 },
      { id: "app", kind: "docker-container", x: 0, y: 2 },
      { id: "db", kind: "docker-postgres", x: 0, y: 3 },
    ],
    edges: [
      { from: "client", to: "proxy" },
      { from: "proxy", to: "app" },
      { from: "app", to: "db" },
    ],
  },
  scenario: "Serve 1,000 req/s at p99 under 200 ms.",
  levels: [{ id: "l1", load: 1000, targets: { rps: 1000, p99Ms: 200, availability: 0.95 } }],
};
