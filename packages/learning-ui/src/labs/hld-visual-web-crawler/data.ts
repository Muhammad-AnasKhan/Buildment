import type { HldLabSpec } from "../types";
import { webCrawlerSolution } from "./solution";

export const hldVisualWebCrawler: HldLabSpec = {
  slug: "hld-visual-web-crawler",
  family: "hld",
  title: "Design a web page collector (a web crawler)",
  purpose:
    "Build DalilBot from parts, press Run, and see whether it fetches pages, saves them and sends the links it finds back as new work, and whether it keeps going when a fetcher, the seen-URL memory or the page parsers stop.",
  limits:
    "A simplified model, not a real cloud. Times are in model milliseconds, the seen-URL memory is always full of useful answers (warm), and prices are made up to compare designs. The client stands for the scheduler that releases URLs, and each machine is counted by a generic CPU rule, not by the downloads it keeps in flight. The board cannot show politeness (one request a second to each site) or crawler traps. The code lab is coming.",
  hints: [
    "Run the starting design first. The fetcher saves each page itself, but the links DalilBot finds go nowhere. Read which checks fail and why.",
    "The seen-URL memory (a cache) answers most of the 'did we fetch this already?' questions itself. Only the misses reach the URL table. When the memory stops, the table gets every question.",
    "Downloaded pages can wait in a queue. Parser workers (the Worker part) take them off it, save the page and add the links they find to the URL table in groups (batches).",
    "Saving a page costs money every time, whatever your design. Spend the rest of the budget on the spare machine and the memory, not on sizes that are too large.",
  ],
  allowedComponents: ["client", "load-balancer", "app-server", "cache", "nosql", "object-storage", "queue", "worker"],
  startingBoard: {
    nodes: [
      { id: "client", kind: "client", x: 0, y: 0 },
      { id: "lb", kind: "load-balancer", x: 0, y: 1, props: { size: "general-small", zones: 1 } },
      { id: "fetch", kind: "app-server", x: 0, y: 2, props: { size: "compute-small", count: 1 } },
      { id: "urls", kind: "nosql", x: 0, y: 3, props: { size: "memory-small", count: 1 } },
      { id: "pages", kind: "object-storage", x: 1, y: 3 },
    ],
    edges: [
      { from: "client", to: "lb" },
      { from: "lb", to: "fetch" },
      { from: "fetch", to: "urls" },
      { from: "fetch", to: "pages" },
    ],
  },
  scenario:
    "DalilBot's busiest hour: 2,700 pages a second, about three and a half times the 770 average of chapter 26.1. Pages must be fetched and saved, the links on them must come back as new work, and the crawl must keep going when a part dies.",
  levels: [
    { id: "l1", load: 2_700, targets: { rps: 2_700, p99Ms: 55, availability: 0.999, budgetPerHour: 5.6 } },
  ],
  solution: webCrawlerSolution,
  challenge: {
    peakLoad: 2_700,
    scenarios: [
      { id: "lose-fetcher", title: "A fetcher dies", story: "One fetcher stops. The balancer sends its pages to the other fetchers.", faults: [{ type: "lose-instance", role: "compute" }] },
      { id: "lose-seen", title: "The seen-URL memory dies", story: "The memory is gone. Every 'did we fetch this?' question now goes to the URL table.", faults: [{ type: "down", role: "cache" }] },
      { id: "lose-parsers", title: "The page parsers die", story: "Fetching carries on. Downloaded pages wait in the queue to be parsed.", faults: [{ type: "down", role: "worker" }] },
    ],
    checks: [
      { type: "path", id: "save-page", kind: "functional", label: "Fetched pages are saved", chain: ["client", "compute", "storage"], target: "a page is saved: scheduler > fetcher > object storage (straight from the fetcher, or through a queue and a parser)" },
      { type: "path", id: "record-url", kind: "functional", label: "Each fetched address is recorded in the URL table", chain: ["client", "compute", "nosql"], target: "the fetcher can look up and record an address in the URL table (the seen-URL memory is optional)" },
      { type: "path", id: "new-links", kind: "functional", label: "Links found on a page come back as new work", chain: ["client", "compute", "queue", "worker", "nosql"], target: "a found link is added: fetcher > queue > parser > URL table" },
      { type: "metric", id: "capacity", kind: "non-functional", label: "Fetches the whole peak", scenario: "steady", metric: "capacity", op: ">=", value: 2_700 },
      { type: "metric", id: "p99", kind: "non-functional", label: "Slowest 1 in 100 fetch jobs is fast enough (p99)", scenario: "steady", metric: "p99", op: "<=", value: 55 },
      { type: "metric", id: "fetcher-dies", kind: "non-functional", label: "Every page is still fetched when one fetcher dies", scenario: "lose-fetcher", metric: "served", op: ">=", value: 0.999 },
      { type: "metric", id: "seen-dies", kind: "non-functional", label: "Every page is still fetched when the seen-URL memory dies", scenario: "lose-seen", metric: "served", op: ">=", value: 0.999 },
      { type: "metric", id: "seen-dies-p99", kind: "non-functional", label: "Slowest 1 in 100 while the memory is down (p99)", scenario: "lose-seen", metric: "p99", op: "<=", value: 65 },
      { type: "drain", id: "parsers-die", kind: "non-functional", label: "No downloaded pages are lost when the parsers die", outageSeconds: 60, maxDrainSeconds: 90, items: "downloaded pages", done: "parsed" },
      { type: "metric", id: "availability", kind: "non-functional", label: "Stays up (availability)", scenario: "steady", metric: "availability", op: ">=", value: 0.999 },
      { type: "metric", id: "cost", kind: "non-functional", label: "Cost per hour", scenario: "steady", metric: "cost", op: "<=", value: 5.6 },
    ],
  },
};
