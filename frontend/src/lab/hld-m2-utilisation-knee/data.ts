import { kindsInFamily } from "../catalog";
import type { HldLabSpec } from "../types";

export const hldM2UtilisationKnee: HldLabSpec = {
  slug: "hld-m2-utilisation-knee",
  family: "hld",
  title: "The utilisation knee",
  purpose: "Push load into one app tier and watch p99 climb once it passes the knee.",
  limits:
    "A steady-state model, not a real cloud. No cold starts, no noisy neighbours, illustrative prices only.",
  hints: ["Add a second app server before the first one passes about 70% busy."],
  allowedComponents: kindsInFamily("hld"),
  startingBoard: {
    nodes: [
      { id: "client", kind: "client", x: 0, y: 1 },
      // The balancer and database are sized with room to spare so the app tier
      // is the part that reaches the knee as the load rises.
      { id: "lb", kind: "load-balancer", x: 1, y: 1, props: { size: "general-xlarge" } },
      { id: "app", kind: "app-server", x: 2, y: 1 },
      { id: "db", kind: "database", x: 3, y: 1, props: { size: "memory-xlarge" } },
    ],
    edges: [
      { from: "client", to: "lb" },
      { from: "lb", to: "app" },
      { from: "app", to: "db" },
    ],
  },
  scenario: "Serve the launch-day load with p99 under 200 ms and stay inside the hourly budget.",
  levels: [
    { id: "l1", load: 1000, targets: { rps: 1000, p99Ms: 200, availability: 0.99 } },
    { id: "l2", load: 5000, targets: { rps: 5000, p99Ms: 200, availability: 0.99 } },
    {
      id: "l3",
      load: 5000,
      targets: { rps: 5000, p99Ms: 200, availability: 0.999 },
      event: "Fail one zone",
    },
  ],
};
