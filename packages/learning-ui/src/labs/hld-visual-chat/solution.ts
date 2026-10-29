import type { SolutionDef } from "../types";

// The reference design recorded in spec.md: 11 of 11 checks at $1.48 an hour.
export const chatSolution: SolutionDef = {
  summary:
    "Enough small gateways that losing one still leaves room, three chat servers in two zones, a cache that answers online-dot lookups with a message store sized to carry everything if the cache stops, and a queue that holds the 400 alert jobs a second (1 request in 10) for two workers that clear a 15 minute backlog in 82 seconds.",
  board: {
    nodes: [
      { id: "client", kind: "client", x: 1, y: 0 },
      { id: "gw", kind: "api-gateway", x: 1, y: 1, props: { size: "compute-small", count: 3 } },
      { id: "chat", kind: "app-server", x: 1, y: 2, props: { size: "compute-small", count: 3, azs: 2 } },
      { id: "cache", kind: "cache", x: 0, y: 3, props: { size: "memory-small", count: 1, hitRate: 0.9, azs: 2 } },
      { id: "store", kind: "nosql", x: 1, y: 3, props: { size: "memory-small", count: 2, azs: 2 } },
      { id: "q", kind: "queue", x: 2, y: 3 },
      { id: "w", kind: "worker", x: 2, y: 4, props: { size: "compute-small", count: 2 } },
    ],
    edges: [
      { from: "client", to: "gw" },
      { from: "gw", to: "chat" },
      { from: "chat", to: "cache" },
      { from: "chat", to: "store" },
      { from: "chat", to: "q" },
      { from: "q", to: "w" },
    ],
  },
  parts: {
    gw: {
      why: "Phones connect to a gateway (a connection server), and every request passes through it first. Three small gateways carry 7,200 requests a second, so the 4,000 at the busiest moment keep each one 56% busy. When one dies, the other two are 83% busy and still serve everyone.",
      checks: ["store", "capacity", "p99", "gateway-dies"],
      without: "With two gateways, one dying leaves room for 2,400 requests a second out of 4,000, so only 60% are served. Even when both are alive they are 83% busy and the slowest 1 in 100 requests (p99) takes 90 ms, over the 74 ms target.",
    },
    chat: {
      why: "The chat servers hold the rules: they save the message, look up who is online and hand the alert job to the queue. Three small servers in two zones are 56% busy at peak, so waiting stays short and one zone going down leaves the service up.",
      checks: ["store", "presence", "alert", "capacity", "p99", "cache-dies-p99", "availability"],
      without: "With two chat servers each is 83% busy, p99 is 147 ms (target 74 ms) and 151 ms while the cache is down (target 120 ms). With all three in one zone, availability falls to 99.88%, under the 99.9% target.",
    },
    cache: {
      why: "The cache holds who is online and the latest messages of busy chats in memory. At a 90% hit rate it answers 3,600 of the 4,000 requests a second itself, so the message store sees only 400 a second and answers faster. Two zones keep the cache up if one zone fails.",
      checks: ["presence", "p99", "cache-dies", "cache-dies-p99", "availability"],
      without: "With no cache, an online dot cannot be read at all (the presence check fails) and every request asks the store: p99 is 76 ms against the 74 ms target. With the cache in one zone only, availability falls to 99.78%.",
    },
    store: {
      why: "The message store keeps every message. Two small nodes in two zones carry 8,000 requests a second. They are 5% busy while the cache works, and still only 50% busy if the cache stops and all 4,000 arrive.",
      checks: ["store", "cache-dies", "cache-dies-p99", "availability"],
      without: "With one small node, a stopped cache puts all 4,000 requests a second on a node that carries 4,000, so it is 100% busy and p99 is 400 ms (target 120 ms). With both nodes in one zone, availability falls to 99.88%.",
    },
    q: {
      why: "About 1 request in 10 needs an alert (chapter 22.2), so 400 alert jobs a second reach the queue, and it holds each job until a worker sends it. The chat servers never wait for an alert, and no alert is lost while the workers are away. The queue is priced per message and costs $0.07 an hour.",
      checks: ["alert", "worker-dies"],
      without: "With no queue there is nowhere for alerts to wait. The alert check fails, and every alert that arrives while the worker is down is lost.",
    },
    w: {
      why: "Two workers take alert jobs from the queue and send them. They handle 4,800 a second, so after the 400 new alerts a second they have 4,400 a second to spare. The 360,000 alerts that wait during a 15 minute outage clear in 82 seconds.",
      checks: ["alert", "worker-dies"],
      without: "One worker handles 2,400 alerts a second and has 2,000 a second to spare, so the 360,000 waiting alerts take 180 seconds, over the 120 second limit. A third worker passes but costs $1.60 an hour, over the $1.55 budget.",
    },
  },
};
