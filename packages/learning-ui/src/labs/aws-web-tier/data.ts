import { kindsInFamily } from "../catalog";
import type { HldLabSpec } from "../types";

export const awsWebTier: HldLabSpec = {
  slug: "aws-web-tier",
  family: "hld",
  title: "A web tier on AWS",
  purpose: "Size an AWS web tier for launch day, then survive losing a zone.",
  limits: "Illustrative us-east-1 on-demand prices from late 2026. No data transfer, no free tier, no reserved or spot pricing.",
  hints: ["CloudFront hits never reach the ALB.", "Multi-AZ RDS and two zones for the fleet are what carry you through level 3."],
  allowedComponents: ["client", ...kindsInFamily("aws")],
  startingBoard: {
    nodes: [
      { id: "client", kind: "client", x: 0, y: 0 },
      { id: "cdn", kind: "aws-cloudfront", x: 0, y: 1 },
      { id: "alb", kind: "aws-alb", x: 0, y: 2 },
      { id: "web", kind: "aws-ec2-asg", x: 0, y: 3 },
      { id: "redis", kind: "aws-elasticache", x: 1, y: 4 },
      { id: "db", kind: "aws-rds", x: 0, y: 4 },
    ],
    edges: [
      { from: "client", to: "cdn" },
      { from: "cdn", to: "alb" },
      { from: "alb", to: "web" },
      { from: "web", to: "redis" },
      { from: "web", to: "db" },
    ],
  },
  scenario: "Serve 5,000 req/s at p99 under 150 ms, 99.9% available, under $18 an hour. At this load CloudFront request pricing is most of the bill.",
  levels: [
    { id: "l1", load: 5000, targets: { rps: 5000, p99Ms: 150, availability: 0.999, budgetPerHour: 18 } },
    { id: "l2", load: 20000, targets: { rps: 20000, p99Ms: 150, availability: 0.999, budgetPerHour: 70 } },
    { id: "l3", load: 20000, targets: { rps: 20000, p99Ms: 150, availability: 0.9995, budgetPerHour: 75 }, event: "Fail one zone" },
  ],
};
