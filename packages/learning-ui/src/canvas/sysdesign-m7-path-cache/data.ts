import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.6 beat 3. A cache lowers read load on the database by the hit rate: at 90%, the database serves one tenth of the reads.
export const sysdesignM7PathCache: SceneSpec = {
  kind: "scene",
  title: "Step 2: a cache removes repeated reads",
  purpose: "The same event page is read thousands of times. With a cache that answers 9 reads in 10, the database sees only 1 read in 10.",
  limits: "The 90% hit rate is an assumption. A cache does nothing for writes, and it can show old data (module 5 covers invalidation).",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "app", label: "App", kind: "server", sub: "10 reads", x: 62, y: 130 },
      { id: "cache", label: "Cache", kind: "cache", sub: "hit rate 90%", x: 210, y: 130 },
      { id: "db", label: "Database", kind: "database", sub: "waiting", x: 358, y: 130 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "app", to: "cache", label: "10 reads" },
      { kind: "fly", at: 1.3, dur: 0.8, from: "cache", to: "app", label: "9 answered", tone: "good" },
      { kind: "fly", at: 1.4, dur: 0.8, from: "cache", to: "db", label: "1 miss", tone: "warn" },
      { kind: "say", at: 2.3, actor: "db", text: "1 read in 10", tone: "good" },
      { kind: "say", at: 2.3, actor: "app", text: "pages fast", tone: "good" },
      { kind: "verdict", at: 3, text: "The database sees 1 read in 10", tone: "good" },
    ],
    loop: 5.8,
  },
};
