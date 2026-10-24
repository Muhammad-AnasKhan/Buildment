import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.3 beat 3: write-through. Every write goes into the cache and on to the
// database before the app hears "ok", so reads find fresh data. The cost the
// ElastiCache guide names: the cache also fills with data nobody reads.
export const sysdesignM5WriteThrough: SceneSpec = {
  kind: "scene",
  title: "Write-through keeps the cache full and fresh",
  purpose: "Each write updates the cache and the database before the reply, so reads hit fresh data, but the cache also holds data that is never read.",
  limits: "The cache layer writes to the database itself here; in practice the app often writes both. One writer, no failures, and time is slowed down.",
  scene: {
    width: 420,
    height: 210,
    actors: [
      { id: "app", label: "App", kind: "server", sub: "writes prices", x: 60, y: 110 },
      { id: "cache", label: "Cache", kind: "cache", sub: "write-through", x: 210, y: 110 },
      { id: "db", label: "Database", kind: "database", sub: "p42 = 999", x: 360, y: 110 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.5, from: "app", to: "cache", label: "set p42=899" },
      { kind: "fly", at: 0.7, dur: 0.5, from: "cache", to: "db", label: "write" },
      { kind: "say", at: 1.2, actor: "db", text: "p42 = 899", tone: "good" },
      { kind: "fly", at: 1.3, dur: 0.5, from: "db", to: "cache", label: "ok" },
      { kind: "fly", at: 1.8, dur: 0.5, from: "cache", to: "app", label: "ok", tone: "good" },
      { kind: "say", at: 2.3, actor: "cache", text: "p42 = 899", tone: "good" },
      { kind: "fly", at: 2.7, dur: 0.5, from: "app", to: "cache", label: "get p42" },
      { kind: "fly", at: 3.2, dur: 0.5, from: "cache", to: "app", label: "hit 899", tone: "good" },
      { kind: "fly", at: 3.9, dur: 0.5, from: "app", to: "cache", label: "set p77=15" },
      { kind: "fly", at: 4.4, dur: 0.5, from: "cache", to: "db", label: "write" },
      { kind: "say", at: 4.9, actor: "cache", text: "p77 never read", tone: "warn" },
      { kind: "verdict", at: 5.2, text: "Fresh reads, plus unread copies", tone: "warn" },
    ],
    loop: 8.2,
  },
};
