import { kindsInFamily } from "../catalog";
import type { HldLabSpec } from "../types";

export const k8sWebApp: HldLabSpec = {
  slug: "k8s-web-app",
  family: "hld",
  title: "A web app on Kubernetes",
  purpose: "Route traffic through an Ingress and a Service to a Deployment, and let the HPA size it.",
  limits: "Pods are priced as a share of node cost. No scheduling onto nodes, no pending pods, no cluster autoscaler yet.",
  hints: ["Raise the HPA max before raising the pod size.", "A LoadBalancer Service rents a cloud load balancer."],
  allowedComponents: ["client", ...kindsInFamily("k8s")],
  startingBoard: {
    nodes: [
      { id: "client", kind: "client", x: 0, y: 0 },
      { id: "ingress", kind: "k8s-ingress", x: 0, y: 1 },
      { id: "svc", kind: "k8s-service", x: 0, y: 2 },
      { id: "web", kind: "k8s-deployment", x: 0, y: 3 },
      { id: "db", kind: "k8s-statefulset", x: 0, y: 4 },
    ],
    edges: [
      { from: "client", to: "ingress" },
      { from: "ingress", to: "svc" },
      { from: "svc", to: "web" },
      { from: "web", to: "db" },
    ],
  },
  scenario: "Serve 2,000 req/s at p99 under 200 ms for under $1 an hour.",
  levels: [{ id: "l1", load: 2000, targets: { rps: 2000, p99Ms: 200, availability: 0.99, budgetPerHour: 1 } }],
};
