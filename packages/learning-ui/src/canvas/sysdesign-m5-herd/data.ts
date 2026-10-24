import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.6 beat 1: the thundering herd on one hot key. 5,000 requests a second
// read the sale page. Its copy expires, and the first miss starts a 50 ms
// query. Until that query returns and the copy is stored again, every
// request misses too: 5,000 x 0.05 s = 250 queries for the same key.
export const sysdesignM5Herd: SceneSpec = {
  kind: "scene",
  title: "A hot key expires: every request misses",
  purpose: "While the first query for the expired page runs, every new request also misses and sends its own query: 250 of them in 50 ms.",
  limits: "Made-up story numbers: 5,000 requests a second and a 50 ms query. In practice the extra queries also slow the database down, so the first query takes longer and even more requests miss.",
  scene: {
    width: 420,
    height: 350,
    actors: [
      { id: "shoppers", label: "Shoppers", kind: "user", sub: "5,000 a second", x: 60, y: 100 },
      { id: "app", label: "App", kind: "server", sub: "cache-aside", x: 210, y: 100 },
      { id: "cache", label: "Cache", kind: "cache", sub: "sale page", x: 360, y: 100 },
      { id: "db", label: "Database", kind: "database", sub: "calm", x: 210, y: 215 },
    ],
    strip: { y: 320, from: 0, to: 60, unit: "ms", caption: "milliseconds after the expiry", every: 10 },
    events: [
      { kind: "say", at: 0.3, actor: "cache", text: "expired", tone: "warn" },
      { kind: "tag", at: 0.3, row: 0, value: 0, label: "expiry" },
      { kind: "fly", at: 0.7, dur: 0.5, from: "shoppers", to: "app", label: "page?" },
      { kind: "fly", at: 1.2, dur: 0.5, from: "app", to: "db", label: "query 1" },
      { kind: "say", at: 1.7, actor: "db", text: "50 ms query" },
      { kind: "fly", at: 1.9, dur: 0.5, from: "shoppers", to: "app", label: "page?" },
      { kind: "fly", at: 2.1, dur: 0.5, from: "shoppers", to: "app", label: "page?" },
      { kind: "fly", at: 2.4, dur: 0.5, from: "app", to: "db", label: "query 2", tone: "bad" },
      { kind: "fly", at: 2.6, dur: 0.5, from: "app", to: "db", label: "query 3", tone: "bad" },
      { kind: "say", at: 3.1, actor: "app", text: "still missing", tone: "warn" },
      { kind: "say", at: 3.6, actor: "db", text: "250 x one query", tone: "bad" },
      { kind: "mark", at: 3.6, actor: "db", tone: "bad" },
      { kind: "tag", at: 3.6, row: 1, value: 50, label: "250 queries by 50 ms", tone: "bad" },
      { kind: "verdict", at: 4.1, text: "250 queries for one key", tone: "bad" },
    ],
    loop: 7.6,
  },
};
