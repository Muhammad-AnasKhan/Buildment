import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.1 beat 1: Matjar's sale page is served from the cache until its copy
// expires at peak. Every request in the next moments misses and asks the
// database, which was sized for the trickle of misses, not for the flood.
// Story numbers are made up: 5,000 requests a second, a 50 ms page query,
// a database that manages about 800 such queries a second.
export const sysdesignM5SaleExpiry: SceneSpec = {
  kind: "scene",
  title: "The copy expires, the database falls",
  purpose: "While the copy lives, every shopper is served from the cache. When it expires at peak, every request misses at once and goes to the database.",
  limits: "A made-up shop with round numbers: 5,000 page requests a second, a 50 ms query, a database that manages about 800 such queries a second. Only three of the requests are drawn, and time is slowed down.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "shoppers", label: "Shoppers", kind: "user", sub: "5,000 a second", x: 60, y: 100 },
      { id: "app", label: "App", kind: "server", sub: "cache-aside", x: 210, y: 100 },
      { id: "cache", label: "Cache", kind: "cache", sub: "has the page", x: 360, y: 100 },
      { id: "db", label: "Database", kind: "database", sub: "calm", x: 210, y: 225 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.5, from: "shoppers", to: "app", label: "page?" },
      { kind: "fly", at: 0.7, dur: 0.4, from: "app", to: "cache", label: "get" },
      { kind: "fly", at: 1.1, dur: 0.4, from: "cache", to: "app", label: "hit", tone: "good" },
      { kind: "say", at: 1.7, actor: "cache", text: "expired", tone: "warn" },
      { kind: "mark", at: 1.7, actor: "cache", tone: "warn" },
      { kind: "fly", at: 2.0, dur: 0.5, from: "shoppers", to: "app", label: "page?" },
      { kind: "fly", at: 2.15, dur: 0.5, from: "shoppers", to: "app", label: "page?" },
      { kind: "fly", at: 2.3, dur: 0.5, from: "shoppers", to: "app", label: "page?" },
      { kind: "say", at: 2.8, actor: "app", text: "all miss", tone: "warn" },
      { kind: "fly", at: 2.9, dur: 0.5, from: "app", to: "db", label: "query", tone: "bad" },
      { kind: "fly", at: 3.05, dur: 0.5, from: "app", to: "db", label: "query", tone: "bad" },
      { kind: "fly", at: 3.2, dur: 0.5, from: "app", to: "db", label: "query", tone: "bad" },
      { kind: "say", at: 3.7, actor: "db", text: "5,000 queries/s", tone: "bad" },
      { kind: "mark", at: 3.7, actor: "db", tone: "bad" },
      { kind: "fly", at: 4.1, dur: 0.6, from: "app", to: "shoppers", label: "timeout", tone: "bad" },
      { kind: "say", at: 4.7, actor: "shoppers", text: "refresh, again", tone: "bad" },
      { kind: "verdict", at: 4.9, text: "One expiry, and the database falls", tone: "bad" },
    ],
    loop: 8,
  },
};
