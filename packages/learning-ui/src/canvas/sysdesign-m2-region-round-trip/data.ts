import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 2.2 beat 3: a round trip inside a region (250 microseconds) is about 2.9
// human days; a simple Redis or MySQL query (500 microseconds) about 5.8.
export const sysdesignM2RegionRoundTrip: SceneSpec = {
  kind: "scene",
  title: "Asking a cache next door takes days",
  purpose: "An app server asks Redis in the same region for one key, with time stretched so 1 ns lasts 1 second.",
  limits: "napkin-math estimates: a round trip inside a region about 250 microseconds and a simple Redis, Memcached or MySQL query about 500 microseconds. A busy network or a slow query can be many times slower.",
  scene: {
    width: 420,
    height: 350,
    actors: [
      { id: "app", kind: "server", label: "App server", sub: "needs user 7", x: 60, y: 200 },
      { id: "redis", kind: "cache", label: "Redis", sub: "same region", x: 360, y: 85 },
    ],
    strip: { y: 320, from: 0, to: 6, unit: "d", caption: "human time (1 ns becomes 1 s)", every: 1 },
    events: [
      { kind: "fly", at: 0.3, dur: 1.2, from: "app", to: "redis", label: "GET user:7" },
      { kind: "wait", at: 0.3, dur: 3.4, actor: "app", label: "waiting {n} days", doneLabel: "waited 5.8 days", total: 5.8 },
      { kind: "say", at: 1.5, actor: "redis", text: "found it", tone: "good" },
      { kind: "fly", at: 2.5, dur: 1.2, from: "redis", to: "app", label: "value" },
      { kind: "say", at: 3.7, actor: "app", text: "got user 7", tone: "warn" },
      { kind: "tag", at: 3.7, row: 0, value: 2.9, label: "network 2.9 d" },
      { kind: "tag", at: 3.9, row: 1, value: 5.8, label: "query 5.8 d", tone: "warn" },
      { kind: "verdict", at: 4.2, text: "One cache query: about 6 days", tone: "warn" },
    ],
    loop: 7.6,
  },
};
