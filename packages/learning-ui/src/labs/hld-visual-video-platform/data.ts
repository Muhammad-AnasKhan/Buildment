import type { HldLabSpec } from "../types";
import { videoPlatformSolution } from "./solution";

export const hldVisualVideoPlatform: HldLabSpec = {
  slug: "hld-visual-video-platform",
  family: "hld",
  title: "Design a video platform (video streaming at scale)",
  purpose:
    "Build a video platform from parts, press Run, and see whether videos play and uploads become playable, and whether the service keeps going when a CDN network, an app server or the transcoding workers stop.",
  limits:
    "A simplified model, not a real cloud. The board counts requests, never bytes, so it cannot show bandwidth, the bill for data sent out (egress), or adaptive bitrate (the player choosing a quality). Those are what make video hard. One request here is one small step, a transcoding job runs at the speed of any request instead of taking seconds, the CDN hit rate is a number you set and the board cannot check, and prices are made up to compare designs. The code lab for this case study is coming.",
  hints: [
    "Run the starting design first. Videos play and uploads are recorded, but it has one of everything. Read which checks fail and which part each reason names.",
    "Every request enters at a CDN (a network of copies close to the viewer). Lamha's logs say it answers half of them, so each CDN's hit rate is 0.5. A higher number is a wish and not a measurement: the board lets you type it, and it makes every check easy and means nothing.",
    "Look at the cost. The board prices a CDN and object storage per request, not per byte, so they are most of the bill, and you can lower them only through the hit rate. Add a machine only where a check asks for it.",
    "A CDN network can fail on its own. With only one, nothing is reachable when it stops. A second CDN, linked the same way, takes the whole load for a small hourly fee.",
    "Uploads are converted by workers that take jobs from a queue. Link the app server to a queue, the queue to a worker, and the worker to object storage. The worker's batch size only helps a database, so leave it at 1.",
  ],
  allowedComponents: ["client", "cdn", "load-balancer", "app-server", "database", "queue", "worker", "object-storage"],
  startingBoard: {
    nodes: [
      { id: "client", kind: "client", x: 1, y: 0 },
      { id: "cdn", kind: "cdn", x: 0, y: 1, props: { hitRate: 0.5 } },
      { id: "lb", kind: "load-balancer", x: 1, y: 2, props: { size: "general-small", zones: 1 } },
      { id: "app", kind: "app-server", x: 1, y: 3, props: { size: "compute-small", count: 1 } },
      { id: "db", kind: "database", x: 0, y: 4, props: { size: "memory-small", readRatio: 0.95 } },
      { id: "store", kind: "object-storage", x: 3, y: 3 },
    ],
    edges: [
      { from: "client", to: "cdn" },
      { from: "cdn", to: "store" },
      { from: "cdn", to: "lb" },
      { from: "lb", to: "app" },
      { from: "app", to: "db" },
    ],
  },
  scenario:
    "One region of Lamha at its busiest second: 1,500 requests reach the CDN, and its logs say the CDN answers half of them. Videos must play, uploads must be recorded and converted, and the service must keep going when a CDN network, an app server or the transcoding workers stop.",
  levels: [
    { id: "l1", load: 1_500, targets: { rps: 1_500, p99Ms: 55, availability: 0.9995, budgetPerHour: 7.6 } },
  ],
  solution: videoPlatformSolution,
  challenge: {
    peakLoad: 1_500,
    scenarios: [
      { id: "lose-edge", title: "A CDN network goes down", story: "One CDN network has an outage. Its share goes to the other network, if there is one.", faults: [{ type: "lose-instance", role: "cdn" }] },
      { id: "lose-app", title: "An app server dies", story: "One app server stops. The load balancer sends its share to the others.", faults: [{ type: "lose-instance", role: "compute" }] },
      { id: "lose-worker", title: "The transcoding workers stop", story: "Uploads keep arriving. Conversion jobs wait in the queue until the workers are back.", faults: [{ type: "down", role: "worker" }] },
    ],
    checks: [
      { type: "path", id: "play", kind: "functional", label: "A video plays", chain: ["client", "cdn", "storage"], target: "a piece of video can be fetched: client > CDN > object storage" },
      { type: "path", id: "upload", kind: "functional", label: "An upload is started and recorded", chain: ["client", "balancer", "compute", "database"], target: "the app server saves the new video's record: client > load balancer > app server > database" },
      { type: "path", id: "playable", kind: "functional", label: "An upload becomes playable", chain: ["compute", "queue", "worker", "storage"], target: "a conversion job reaches a worker, which saves the result: app server > queue > worker > object storage" },
      { type: "metric", id: "p99", kind: "non-functional", label: "Slowest 1 in 100 requests is fast enough (p99)", scenario: "steady", metric: "p99", op: "<=", value: 55 },
      { type: "metric", id: "edge-dies", kind: "non-functional", label: "Everyone is still served when one CDN network goes down", scenario: "lose-edge", metric: "served", op: ">=", value: 0.999 },
      { type: "metric", id: "app-dies", kind: "non-functional", label: "Everyone is still served when one app server dies", scenario: "lose-app", metric: "served", op: ">=", value: 0.999 },
      { type: "drain", id: "worker-dies", kind: "non-functional", label: "No conversion jobs are lost when the workers stop", outageSeconds: 60, maxDrainSeconds: 20, items: "jobs", done: "converted" },
      { type: "metric", id: "availability", kind: "non-functional", label: "Stays up (availability)", scenario: "steady", metric: "availability", op: ">=", value: 0.9995 },
      { type: "metric", id: "cost", kind: "non-functional", label: "Cost per hour", scenario: "steady", metric: "cost", op: "<=", value: 7.6 },
    ],
  },
};
