import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.3 beat 1: cache-aside (lazy loading). The app asks the cache; on a miss
// it reads the database and puts a copy in the cache with a TTL. AWS's
// ElastiCache guide counts three trips for a miss and one for a hit.
export const sysdesignM5AsideRead: SceneSpec = {
  kind: "scene",
  title: "Cache-aside: a miss costs three trips",
  purpose: "The app checks the cache, reads the database on a miss, and stores a copy; the next read is one trip.",
  limits: "One app, one key and no failures. The cache never talks to the database: the app does both jobs. Time is slowed down; each trip is about 0.5 ms in a real data centre.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "app", label: "App", kind: "server", sub: "needs p42", x: 210, y: 100 },
      { id: "cache", label: "Cache", kind: "cache", sub: "empty", x: 60, y: 220 },
      { id: "db", label: "Database", kind: "database", sub: "p42 = 999", x: 360, y: 220 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.6, from: "app", to: "cache", label: "1 get p42" },
      { kind: "fly", at: 0.8, dur: 0.6, from: "cache", to: "app", label: "miss", tone: "warn" },
      { kind: "fly", at: 1.5, dur: 0.6, from: "app", to: "db", label: "2 read p42" },
      { kind: "fly", at: 2.1, dur: 0.6, from: "db", to: "app", label: "999" },
      { kind: "fly", at: 2.8, dur: 0.6, from: "app", to: "cache", label: "3 set, TTL 60 s" },
      { kind: "say", at: 3.4, actor: "cache", text: "p42 = 999", tone: "good" },
      { kind: "say", at: 3.4, actor: "app", text: "miss: 3 trips", tone: "warn" },
      { kind: "fly", at: 3.9, dur: 0.6, from: "app", to: "cache", label: "get p42" },
      { kind: "fly", at: 4.5, dur: 0.6, from: "cache", to: "app", label: "hit", tone: "good" },
      { kind: "say", at: 5.1, actor: "app", text: "hit: 1 trip", tone: "good" },
      { kind: "verdict", at: 5.3, text: "Miss: 3 trips. Hit: 1 trip", tone: "good" },
    ],
    loop: 8.3,
  },
};
