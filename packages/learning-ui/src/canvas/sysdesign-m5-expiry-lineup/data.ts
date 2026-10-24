import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.6 beat 4: synchronised expiries. After a restart, 1,000 product pages
// are cached in the same second, all with a TTL of 60 s, so all expire in
// the same second 60 s later. A random TTL between 54 and 66 s spreads the
// same 1,000 misses over 12 seconds: about 83 a second.
export const sysdesignM5ExpiryLineup: SceneSpec = {
  kind: "scene",
  title: "Same TTL, same second: expiries line up",
  purpose: "1,000 copies stored together with the same 60 s TTL all expire together; a random TTL from 54 to 66 s spreads the misses over 12 seconds.",
  limits: "Made-up numbers. Keys stored at different times expire at different times anyway; this matters after a restart, a deploy or a bulk load, when many keys are stored together.",
  scene: {
    width: 420,
    height: 350,
    actors: [
      { id: "app", label: "App", kind: "server", sub: "just restarted", x: 60, y: 100 },
      { id: "cache", label: "Cache", kind: "cache", sub: "empty", x: 360, y: 100 },
      { id: "db", label: "Database", kind: "database", sub: "calm", x: 210, y: 215 },
    ],
    strip: { y: 320, from: 0, to: 70, unit: "s", caption: "seconds after the restart", every: 10 },
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "app", to: "cache", label: "1,000 sets" },
      { kind: "say", at: 1.0, actor: "cache", text: "all TTL 60 s" },
      { kind: "tag", at: 1.0, row: 0, value: 0, label: "stored at 0 s" },
      { kind: "say", at: 1.7, actor: "cache", text: "all expired", tone: "bad" },
      { kind: "tag", at: 1.7, row: 0, value: 60, label: "all at 60 s", tone: "bad" },
      { kind: "fly", at: 2.0, dur: 0.6, from: "app", to: "db", label: "1,000 misses", tone: "bad" },
      { kind: "say", at: 2.6, actor: "db", text: "spike", tone: "bad" },
      { kind: "mark", at: 2.6, actor: "db", tone: "bad" },
      { kind: "say", at: 3.3, actor: "cache", text: "TTL 54 to 66 s", tone: "good" },
      { kind: "tag", at: 3.4, row: 1, value: 60, label: "spread 54 to 66 s", tone: "good" },
      { kind: "fly", at: 3.8, dur: 0.6, from: "app", to: "db", label: "about 83 a second", tone: "good" },
      { kind: "say", at: 4.4, actor: "db", text: "smooth", tone: "good" },
      { kind: "mark", at: 4.4, actor: "db", tone: "good" },
      { kind: "verdict", at: 4.7, text: "Random TTLs spread the misses", tone: "good" },
    ],
    loop: 8,
  },
};
