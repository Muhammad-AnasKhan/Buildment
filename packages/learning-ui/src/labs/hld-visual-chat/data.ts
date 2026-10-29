import type { HldLabSpec } from "../types";
import { chatSolution } from "./solution";

export const hldVisualChat: HldLabSpec = {
  slug: "hld-visual-chat",
  family: "hld",
  title: "Design a chat service (messages, online dots and alerts)",
  purpose:
    "Build the back end of a chat app from parts, press Run, and see whether it stores messages, shows who is online and sends an alert to a closed app, and whether it keeps doing so when a connection server, the cache or the alert worker dies.",
  limits:
    "A simplified model, not a real cloud. Every request counts alike except that about 1 in 10 needs an alert (chapter 22.2), times are in model milliseconds, the cache is always warm (full of useful answers), and prices are made up to compare designs. The board counts requests a second, not open phone connections, and it cannot show message order or delivery receipts.",
  hints: [
    "Run the starting design first. It stores messages, but read which checks fail and why. It cannot show who is online, and it cannot alert a closed app.",
    "A gateway (connection server) holds the open lines to phones. When one dies, its phones move to the others, so the gateways that are left must carry the whole peak.",
    "A cache answers online-dot lookups from memory, so the message store sees only the misses. When the cache stops, the store gets every request, so it must be able to carry them all.",
    "About 1 request in 10 needs an alert, so 400 alert jobs a second reach the queue. A queue holds them while the worker is away, and the workers must send faster than new ones arrive, or the backlog never clears. The longer the outage, the bigger the backlog.",
    "Spare machines cost money. Add the extra machine only where a check asks for it.",
  ],
  allowedComponents: ["client", "api-gateway", "app-server", "cache", "nosql", "queue", "worker"],
  startingBoard: {
    nodes: [
      { id: "client", kind: "client", x: 0, y: 0 },
      { id: "gw", kind: "api-gateway", x: 0, y: 1, props: { size: "compute-small", count: 2 } },
      { id: "chat", kind: "app-server", x: 0, y: 2, props: { size: "compute-small", count: 2 } },
      { id: "store", kind: "nosql", x: 0, y: 3, props: { size: "memory-small", count: 1 } },
    ],
    edges: [
      { from: "client", to: "gw" },
      { from: "gw", to: "chat" },
      { from: "chat", to: "store" },
    ],
  },
  scenario:
    "Dardasha launches in its first city: 4,000 chat requests a second at the busiest moment (people sending messages, opening chats and checking who is online). Messages must be saved, online dots shown and alerts sent to closed apps, and the service must keep going when a part dies.",
  levels: [{ id: "l1", load: 4_000, targets: { rps: 4_000, p99Ms: 74, availability: 0.999, budgetPerHour: 1.55 } }],
  solution: chatSolution,
  challenge: {
    peakLoad: 4_000,
    shares: { queue: 0.1 },
    scenarios: [
      { id: "lose-gateway", title: "A connection server dies", story: "One gateway stops and its phones reconnect to the others.", faults: [{ type: "lose-instance", role: "gateway" }] },
      { id: "lose-cache", title: "The online-dot cache dies", story: "The cache is gone. Every request now asks the message store.", faults: [{ type: "down", role: "cache" }] },
      { id: "lose-worker", title: "The alert worker dies", story: "Chats carry on. For 15 minutes alerts wait in the queue to be sent.", faults: [{ type: "down", role: "worker" }] },
    ],
    checks: [
      { type: "path", id: "store", kind: "functional", label: "A message is stored", chain: ["client", "gateway", "compute", "nosql"], target: "a message is saved: client > gateway > chat server > message store" },
      { type: "path", id: "presence", kind: "functional", label: "A friend's online dot can be read", chain: ["client", "gateway", "compute", "cache"], target: "the chat server can read who is online from a cache" },
      { type: "path", id: "alert", kind: "functional", label: "An alert reaches a phone whose app is closed", chain: ["client", "gateway", "compute", "queue", "worker"], target: "an alert is sent: chat server > queue > worker" },
      { type: "metric", id: "capacity", kind: "non-functional", label: "Serves the whole peak", scenario: "steady", metric: "capacity", op: ">=", value: 4_000 },
      { type: "metric", id: "p99", kind: "non-functional", label: "Slowest 1 in 100 requests is fast enough (p99)", scenario: "steady", metric: "p99", op: "<=", value: 74 },
      { type: "metric", id: "gateway-dies", kind: "non-functional", label: "Everyone is still served when a connection server dies", scenario: "lose-gateway", metric: "served", op: ">=", value: 0.999 },
      { type: "metric", id: "cache-dies", kind: "non-functional", label: "Everyone is still served when the cache dies", scenario: "lose-cache", metric: "served", op: ">=", value: 0.999 },
      { type: "metric", id: "cache-dies-p99", kind: "non-functional", label: "Slowest 1 in 100 while the cache is down (p99)", scenario: "lose-cache", metric: "p99", op: "<=", value: 120 },
      { type: "drain", id: "worker-dies", kind: "non-functional", label: "No alerts are lost when the worker dies", outageSeconds: 900, maxDrainSeconds: 120, items: "alerts", done: "sent" },
      { type: "metric", id: "availability", kind: "non-functional", label: "Stays up (availability)", scenario: "steady", metric: "availability", op: ">=", value: 0.999 },
      { type: "metric", id: "cost", kind: "non-functional", label: "Cost per hour", scenario: "steady", metric: "cost", op: "<=", value: 1.55 },
    ],
  },
};
