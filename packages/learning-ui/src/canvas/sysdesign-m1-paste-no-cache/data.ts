import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Beat 6 of 1.4: a trade-off. At about 12 reads a second and about 0.5 ms
// per simple query (napkin-math), the database is busy about 6 ms in every
// second, under 1%. A cache would add cost, stale copies and one more part
// that can fail, for no gain yet.
export const sysdesignM1PasteNoCache: SceneSpec = {
  kind: "scene",
  title: "Trade-off: a cache is not worth it yet",
  purpose: "Reads reach the database, which is under 1% busy; the cache is considered and turned down for now.",
  limits: "Uses napkin-math's rough figure of about 0.5 ms for a simple database query, which its author says can be 2 to 3 times off. Real queries can be slower. The decision changes if one paste goes viral, which the chapter's fold covers.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "app", label: "App", kind: "server", sub: "12 reads/s", x: 70, y: 110 },
      { id: "db", label: "Database", kind: "database", sub: "waiting", x: 330, y: 110 },
      { id: "cache", label: "Cache?", kind: "cache", sub: "not added", x: 200, y: 228 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 0.6, from: "app", to: "db", label: "read" },
      { kind: "fly", at: 0.7, dur: 0.6, from: "app", to: "db", label: "read" },
      { kind: "fly", at: 1.4, dur: 0.6, from: "app", to: "db", label: "read" },
      { kind: "say", at: 2.0, actor: "db", text: "under 1% busy", tone: "good" },

      { kind: "fly", at: 2.5, dur: 0.8, from: "app", to: "cache", label: "add a cache?" },
      { kind: "say", at: 3.3, actor: "cache", text: "+cost, +stale", tone: "warn" },
      { kind: "fly", at: 3.4, dur: 0.8, from: "cache", to: "app", label: "not yet", tone: "warn" },
      { kind: "say", at: 4.2, actor: "app", text: "keep it simple", tone: "good" },
      { kind: "verdict", at: 4.4, text: "At 12 reads/s, skip the cache", tone: "good" },
    ],
    loop: 7.4,
  },
};
