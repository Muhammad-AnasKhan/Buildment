import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 20.4 beat 6: The cache restarts empty and the database takes every redirect.
export const sysdesignM20CacheLoss: SceneSpec = {
  kind: "scene",
  title: "A cache that restarts empty sends everything to the database",
  purpose: "With a 90% hit rate the database sees about 11,000 operations a second at peak. When the cache restarts empty, every redirect misses, and the database is asked for about 101,000.",
  limits: "Course numbers: 100,000 redirects and 1,000 new links a second at peak, and a database sized for about 11,000 operations a second. A cache spread over several nodes loses only a slice when one node restarts.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "svc", label: "Redirect", kind: "server", sub: "100,000/s", x: 70, y: 100 },
      { id: "cache", label: "Cache", kind: "cache", sub: "90% hits", x: 350, y: 100 },
      { id: "db", label: "Database", kind: "database", sub: "11,000/s", x: 210, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "svc", to: "cache", label: "lookup" },
      { kind: "fly", at: 1.0, dur: 0.7, from: "cache", to: "svc", label: "hit", tone: "good" },
      { kind: "say", at: 1.9, actor: "cache", text: "restarted", tone: "bad" },
      { kind: "mark", at: 1.9, actor: "cache", tone: "bad" },
      { kind: "fly", at: 2.4, dur: 0.8, from: "svc", to: "cache", label: "lookup" },
      { kind: "fly", at: 3.2, dur: 0.7, from: "cache", to: "svc", label: "miss", tone: "bad" },
      { kind: "fly", at: 4.0, dur: 0.9, from: "svc", to: "db", label: "101,000/s", tone: "warn" },
      { kind: "say", at: 4.9, actor: "db", text: "9x its load", tone: "bad" },
      { kind: "mark", at: 4.9, actor: "db", tone: "bad" },
      { kind: "verdict", at: 5.1, text: "Cold cache: database drowns", tone: "bad" },
    ],
    loop: 8.5,
  },
};
