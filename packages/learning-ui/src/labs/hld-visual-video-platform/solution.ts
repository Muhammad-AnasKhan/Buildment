import type { SolutionDef } from "../types";

// The reference design recorded in spec.md: 9 of 9 checks at $7.51 an hour.
export const videoPlatformSolution: SolutionDef = {
  summary:
    "Put two CDN networks in front, so each answers half of the requests itself and losing one still leaves one. Behind them keep the work small but doubled: two load balancer zones, two app servers in two zones, a database with a read-only copy and a standby, and a queue with two workers that convert uploads into playable video.",
  board: {
    nodes: [
      { id: "client", kind: "client", x: 1, y: 0 },
      { id: "cdn", kind: "cdn", x: 0, y: 1, props: { hitRate: 0.5 } },
      { id: "cdn2", kind: "cdn", x: 2, y: 1, props: { hitRate: 0.5 } },
      { id: "lb", kind: "load-balancer", x: 1, y: 2, props: { size: "general-small", zones: 2 } },
      { id: "app", kind: "app-server", x: 1, y: 3, props: { size: "compute-small", count: 2, azs: 2 } },
      { id: "db", kind: "database", x: 0, y: 4, props: { size: "memory-small", replicas: 1, readRatio: 0.95, multiAz: 1 } },
      { id: "q", kind: "queue", x: 1, y: 4 },
      { id: "w", kind: "worker", x: 2, y: 4, props: { size: "compute-small", count: 2, batchSize: 1 } },
      { id: "store", kind: "object-storage", x: 3, y: 3 },
    ],
    edges: [
      { from: "client", to: "cdn" },
      { from: "client", to: "cdn2" },
      { from: "cdn", to: "store" },
      { from: "cdn2", to: "store" },
      { from: "cdn", to: "lb" },
      { from: "cdn2", to: "lb" },
      { from: "lb", to: "app" },
      { from: "app", to: "db" },
      { from: "app", to: "q" },
      { from: "q", to: "w" },
      { from: "w", to: "store" },
    ],
  },
  parts: {
    cdn: {
      why: "The front door. Every request arrives at a CDN, and at a hit rate of 0.5 the CDN answers half of them itself, so only 750 of the 1,500 requests a second go on to your servers and storage. The board charges a CDN for every request it handles, so this one costs $2.05 an hour, and the pair $4.09, more than half of the whole bill.",
      checks: ["play", "edge-dies", "cost"],
      without: "With no CDN at all, a client has nowhere to send a play or an upload, and only 3 of 9 checks pass. Keep the CDN but let its hit rate fall to 0.3 and the storage bill rises to $3.03 an hour: the total is $8.42, over the $7.60 budget.",
    },
    cdn2: {
      why: "A second CDN network, linked the same way. In peaceful times the two share the requests (750 a second each), and the second adds only its $0.02 hourly fee. When one network has an outage, the other takes all 1,500 a second.",
      checks: ["edge-dies"],
      without: "With one CDN, the client has no other way in. When that CDN goes down nothing is served: 0.0% of requests, against the 99.9% needed.",
    },
    lb: {
      why: "The 750 requests a second that get past the CDN meet the load balancer, which spreads them over the app servers. One small zone carries 1,600 a second. Two zones carry 3,200, so it is 23% busy, and the load balancer is not a single point of failure.",
      checks: ["upload", "availability"],
      without: "With one zone the load balancer is the weak link: availability falls to 99.86%, under the 99.95% target. Capacity is not the problem (it is 47% busy), so a third zone only adds cost: $7.61 an hour.",
    },
    app: {
      why: "Two app servers in two zones. They check the user, record the new video in the database and put a conversion job on the queue. Each is 16% busy at peak, and 31% busy when one has died, so one spare machine (N+1) keeps everyone served.",
      checks: ["upload", "app-dies", "availability", "p99"],
      without: "With one app server, losing it serves nobody: 0.0%. With two servers in one zone, availability falls to 99.91%, under 99.95%. A third server serves well but costs $7.63 an hour, over the budget.",
    },
    db: {
      why: "The database holds each video's record: its title, its owner and whether it is ready. One read-only copy (a read replica) shares the reads, so the database is 30% busy and p99 is 50 ms. An extra copy in a second zone (a failover standby) takes over if the main copy's zone fails, which keeps availability at 99.96%.",
      checks: ["upload", "p99", "availability"],
      without: "With no read-only copy the database is 59% busy and p99 rises to 58 ms, over the 55 ms target. With no standby, the database is the weak link and availability falls to 99.81%, under 99.95%.",
    },
    q: {
      why: "The queue holds each conversion job until a worker takes it. The upload never waits for the conversion, and when the workers stop, the jobs wait: 45,000 of them after 60 seconds at 750 jobs a second.",
      checks: ["playable", "worker-dies"],
      without: "With no queue, an upload can never become playable, and when the workers stop, 90,000 jobs are lost in 60 seconds: both the playable check and the worker check fail. (The board counts every request that reaches the CDN, 1,500 a second, as a job that is lost.)",
    },
    w: {
      why: "Two workers take jobs from the queue and save the converted video in object storage. They are 16% busy at peak. When they come back after a minute they have 4,050 jobs a second to spare, so the 45,000 waiting jobs are converted in 12 seconds, inside the 20 seconds allowed.",
      checks: ["playable", "worker-dies"],
      without: "One worker has only 1,650 jobs a second to spare, so the same 45,000 waiting jobs take 28 seconds, over the 20 allowed. With a queue and no worker, the jobs pile up and are never converted.",
    },
    store: {
      why: "Object storage keeps the video files: the raw upload, and the playable versions the workers make. The CDN reads from it on a miss. The board charges storage for every request, $2.17 an hour for the 1,500 a second that reach it.",
      checks: ["play", "playable", "cost"],
      without: "With no storage, a play has nowhere to fetch from and a worker has nowhere to save its result, so the play check and the playable check both fail (7 of 9 pass).",
    },
  },
};
