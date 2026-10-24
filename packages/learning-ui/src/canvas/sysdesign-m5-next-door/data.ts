import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.2 beat 3: next to the database, a cache read and a simple query cost
// about the same, about 0.5 ms each in napkin-math. The cache saves time only
// when one read replaces several queries, like a whole product page.
export const sysdesignM5NextDoor: SceneSpec = {
  kind: "scene",
  title: "Next door, a cache saves little time",
  purpose: "One cache read and one simple query both take about 0.5 ms; a page that needs 5 queries takes 2.5 ms, and one cache read of the whole page replaces them.",
  limits: "napkin-math rounds a Redis, Memcached or MySQL query to about 500 microseconds and says its numbers can be 2 to 3 times off. The 5 queries per page is a made-up story number. Real queries with joins or sorting can take far longer.",
  scene: {
    width: 420,
    height: 350,
    actors: [
      { id: "app", label: "App", kind: "server", sub: "needs a price", x: 210, y: 100 },
      { id: "cache", label: "Valkey", kind: "cache", sub: "has the price", x: 60, y: 215 },
      { id: "db", label: "Database", kind: "database", sub: "simple query", x: 360, y: 215 },
    ],
    strip: { y: 320, from: 0, to: 3, unit: "ms", caption: "time for the read", every: 0.5 },
    events: [
      { kind: "fly", at: 0.2, dur: 0.6, from: "app", to: "cache", label: "get price" },
      { kind: "fly", at: 0.8, dur: 0.6, from: "cache", to: "app", label: "price", tone: "good" },
      { kind: "tag", at: 1.4, row: 0, value: 0.5, label: "Valkey 0.5 ms", tone: "good" },
      { kind: "fly", at: 1.7, dur: 0.6, from: "app", to: "db", label: "SELECT price" },
      { kind: "fly", at: 2.3, dur: 0.6, from: "db", to: "app", label: "price" },
      { kind: "tag", at: 2.9, row: 1, value: 0.5, label: "query 0.5 ms" },
      { kind: "say", at: 2.9, actor: "app", text: "same time", tone: "warn" },
      { kind: "say", at: 3.5, actor: "db", text: "page: 5 queries", tone: "warn" },
      { kind: "tag", at: 3.7, row: 1, value: 2.5, label: "5 queries 2.5 ms", tone: "warn" },
      { kind: "say", at: 4.3, actor: "cache", text: "has whole page", tone: "good" },
      { kind: "say", at: 4.3, actor: "app", text: "1 read: 0.5 ms", tone: "good" },
      { kind: "verdict", at: 4.7, text: "Cache the page, not one query", tone: "good" },
    ],
    loop: 8,
  },
};
