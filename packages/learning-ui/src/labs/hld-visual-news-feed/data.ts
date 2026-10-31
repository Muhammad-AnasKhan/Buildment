import type { HldLabSpec } from "../types";
import { newsFeedSolution } from "./solution";

export const hldVisualNewsFeed: HldLabSpec = {
  slug: "hld-visual-news-feed",
  family: "hld",
  title: "Design a home feed (a news feed)",
  purpose:
    "Build a home-feed service from parts, press Run, and see whether it saves posts, opens feeds and delivers every new post to the followers, and whether it keeps doing so when a server, the feed cache or the fan-out worker dies.",
  limits:
    "A simplified model, not a real cloud. Times are in model milliseconds, the feed cache is always warm, and prices are made up to compare designs. About 1 request in 50 is a post (chapter 21.1) and sends one job to the queue, but every job weighs the same, so the board cannot show one account with millions of followers (the celebrity problem), a cache that restarts empty, or ranking.",
  hints: [
    "Run the starting design first. It saves posts and builds each feed straight from the database. Read which checks fail and why.",
    "A cache of ready feeds answers most feed opens from memory, so only the misses reach the database. Without it the database does every read, and when the cache stops it does them all at once.",
    "Fan-out on write needs three links in a row: the app server puts each new post on a queue, a worker takes it from the queue, and the worker writes it into the cache. A queue with no worker, or a worker not linked to the cache, delivers nothing.",
    "When the worker stops, new posts wait in the queue. After it returns, the worker must handle the posts arriving now and the posts that waited. Only about 1 request in 50 is a post, so one small worker has plenty of room. Spare machines cost money, so add them only where a check asks.",
  ],
  allowedComponents: ["client", "load-balancer", "app-server", "cache", "database", "queue", "worker"],
  startingBoard: {
    nodes: [
      { id: "client", kind: "client", x: 0, y: 0 },
      { id: "lb", kind: "load-balancer", x: 0, y: 1, props: { size: "general-small", zones: 1 } },
      { id: "app", kind: "app-server", x: 0, y: 2, props: { size: "compute-small", count: 1 } },
      { id: "db", kind: "database", x: 0, y: 3, props: { size: "memory-medium", readRatio: 0.98 } },
    ],
    edges: [
      { from: "client", to: "lb" },
      { from: "lb", to: "app" },
      { from: "app", to: "db" },
    ],
  },
  scenario:
    "Launch week: 3,200 feed opens a second at the busiest moment, about a fifth of the 17,400 of chapter 21.1. People must be able to post, open their feed and see the posts of the accounts they follow, and the service must keep answering when a part dies.",
  levels: [{ id: "l1", load: 3_200, targets: { rps: 3_200, p99Ms: 65, availability: 0.999, budgetPerHour: 1.95 } }],
  solution: newsFeedSolution,
  challenge: {
    peakLoad: 3_200,
    shares: { queue: 0.02 },
    scenarios: [
      { id: "lose-app", title: "An app server dies", story: "One app server stops. The load balancer sends its share to the others.", faults: [{ type: "lose-instance", role: "compute" }] },
      { id: "lose-cache", title: "The feed cache dies", story: "The cache holding the ready feeds is gone. Every feed open now asks the database.", faults: [{ type: "down", role: "cache" }] },
      { id: "lose-worker", title: "The fan-out worker dies", story: "Feeds still open. New posts wait in the queue to be delivered.", faults: [{ type: "down", role: "worker" }] },
    ],
    checks: [
      { type: "path", id: "post", kind: "functional", label: "A post is saved", chain: ["client", "compute", "database"], target: "a new post can be saved: client > app server > database" },
      { type: "path", id: "read", kind: "functional", label: "A feed can be opened", chain: ["client", "compute", "database"], target: "the app server can read posts from the database (the cache is optional)" },
      { type: "path", id: "fanout", kind: "functional", label: "A new post reaches followers' feeds", chain: ["client", "compute", "queue", "worker", "cache"], target: "a post is delivered: app server > queue > worker > cache of ready feeds" },
      { type: "metric", id: "capacity", kind: "non-functional", label: "Serves the whole peak", scenario: "steady", metric: "capacity", op: ">=", value: 3_200 },
      { type: "metric", id: "p99", kind: "non-functional", label: "Slowest 1 in 100 feed opens is fast enough (p99)", scenario: "steady", metric: "p99", op: "<=", value: 65 },
      { type: "metric", id: "app-dies", kind: "non-functional", label: "Everyone is still served when one app server dies", scenario: "lose-app", metric: "served", op: ">=", value: 0.999 },
      { type: "metric", id: "cache-dies", kind: "non-functional", label: "Everyone is still served when the feed cache dies", scenario: "lose-cache", metric: "served", op: ">=", value: 0.999 },
      { type: "metric", id: "cache-dies-p99", kind: "non-functional", label: "Slowest 1 in 100 while the feed cache is down (p99)", scenario: "lose-cache", metric: "p99", op: "<=", value: 100 },
      { type: "drain", id: "worker-dies", kind: "non-functional", label: "No posts are lost when the fan-out worker dies", outageSeconds: 120, maxDrainSeconds: 10, items: "posts", done: "delivered to feeds" },
      { type: "metric", id: "availability", kind: "non-functional", label: "Stays up (availability)", scenario: "steady", metric: "availability", op: ">=", value: 0.999 },
      { type: "metric", id: "cost", kind: "non-functional", label: "Cost per hour", scenario: "steady", metric: "cost", op: "<=", value: 1.95 },
    ],
  },
};
