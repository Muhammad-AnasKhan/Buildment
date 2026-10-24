import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.5 beat 1: invalidation by TTL alone. The price changes in the database
// at 0 s, but the cached copy was stored just before with a 60-second TTL,
// so shoppers see the old price until it expires. The stale window is up to
// the whole TTL.
export const sysdesignM5TtlStale: SceneSpec = {
  kind: "scene",
  title: "With TTL alone, old data lives until it expires",
  purpose: "The price changes at 0 s, but the cache keeps serving the old price until its copy expires at 60 s.",
  limits: "The copy was stored just before the write, the worst case. On average the stale window is shorter, but it can be as long as the whole TTL, and nothing in the cache knows the data changed.",
  scene: {
    width: 420,
    height: 350,
    actors: [
      { id: "admin", label: "Admin", kind: "user", sub: "sets 899", x: 60, y: 100 },
      { id: "db", label: "Database", kind: "database", sub: "p42 = 999", x: 210, y: 100 },
      { id: "cache", label: "Cache", kind: "cache", sub: "999, TTL 60 s", x: 360, y: 100 },
      { id: "shopper", label: "Shopper", kind: "phone", sub: "browsing", x: 210, y: 215 },
    ],
    strip: { y: 320, from: 0, to: 70, unit: "s", caption: "seconds after the price change", every: 10 },
    events: [
      { kind: "fly", at: 0.3, dur: 0.5, from: "admin", to: "db", label: "price 899" },
      { kind: "say", at: 0.8, actor: "db", text: "p42 = 899", tone: "good" },
      { kind: "tag", at: 0.8, row: 0, value: 0, label: "write at 0 s" },
      { kind: "fly", at: 1.4, dur: 0.6, from: "shopper", to: "cache", label: "page?" },
      { kind: "say", at: 2.0, actor: "cache", text: "still 999", tone: "warn" },
      { kind: "fly", at: 2.1, dur: 0.6, from: "cache", to: "shopper", label: "999", tone: "bad" },
      { kind: "say", at: 2.7, actor: "shopper", text: "sees 999", tone: "bad" },
      { kind: "tag", at: 2.7, row: 1, value: 20, label: "read at 20 s: 999", tone: "bad" },
      { kind: "say", at: 3.5, actor: "cache", text: "expired", tone: "accent" },
      { kind: "tag", at: 3.5, row: 0, value: 60, label: "expires at 60 s", tone: "warn" },
      { kind: "fly", at: 4.0, dur: 0.6, from: "shopper", to: "cache", label: "page?" },
      { kind: "say", at: 4.6, actor: "cache", text: "reloaded 899", tone: "good" },
      { kind: "say", at: 4.6, actor: "shopper", text: "sees 899", tone: "good" },
      { kind: "verdict", at: 5.0, text: "Stale for up to the whole TTL", tone: "warn" },
    ],
    loop: 8.2,
  },
};
