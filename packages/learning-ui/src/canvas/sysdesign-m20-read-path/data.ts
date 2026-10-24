import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 20.4 beat 1: One redirect that misses the cache: three trips, and the next one hits.
export const sysdesignM20ReadPath: SceneSpec = {
  kind: "scene",
  title: "A cache miss takes three trips; the next click takes one",
  purpose: "The redirect service asks the cache, finds nothing, reads the database and stores the answer in the cache. The next click for /aB3x9Kp finds it in the cache.",
  limits: "Course numbers: a hit costs 0.55 ms and a miss 3.05 ms at the redirect service. Network time to the phone is not counted.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "taps the link", x: 70, y: 100 },
      { id: "svc", label: "Redirect", kind: "server", sub: "GET /aB3x9Kp", x: 350, y: 100 },
      { id: "cache", label: "Cache", kind: "cache", sub: "empty", x: 70, y: 235 },
      { id: "db", label: "Database", kind: "database", sub: "30B links", x: 350, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "phone", to: "svc", label: "GET /aB3x9Kp" },
      { kind: "fly", at: 1.1, dur: 0.8, from: "svc", to: "cache", label: "trip 1: look" },
      { kind: "say", at: 1.9, actor: "cache", text: "miss", tone: "bad" },
      { kind: "fly", at: 2.0, dur: 0.7, from: "cache", to: "svc", label: "not here", tone: "bad" },
      { kind: "fly", at: 2.8, dur: 0.8, from: "svc", to: "db", label: "trip 2: read" },
      { kind: "say", at: 3.6, actor: "db", text: "found URL", tone: "good" },
      { kind: "fly", at: 3.7, dur: 0.7, from: "db", to: "svc", label: "long URL" },
      { kind: "fly", at: 4.5, dur: 0.8, from: "svc", to: "cache", label: "trip 3: store" },
      { kind: "say", at: 5.3, actor: "cache", text: "has aB3x9Kp", tone: "good" },
      { kind: "fly", at: 5.4, dur: 0.8, from: "svc", to: "phone", label: "302 + URL" },
      { kind: "say", at: 6.2, actor: "phone", text: "redirected", tone: "good" },
      { kind: "verdict", at: 6.2, text: "Miss: 3 trips. Next time: 1 trip", tone: "good" },
    ],
    loop: 9.5,
  },
};
