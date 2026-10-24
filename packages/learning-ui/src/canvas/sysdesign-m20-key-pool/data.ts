import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 20.3 beat 5: A key maker fills a pool with random unused codes ahead of time.
export const sysdesignM20KeyPool: SceneSpec = {
  kind: "scene",
  title: "A key maker fills a pool of random codes ahead of time",
  purpose: "A background job makes 17 million random 7-character codes, one day of supply at Wasla's rate. An app takes 1,000 at a time, and the pool marks them used.",
  limits: "One pool and one app. The pool is one more system to run and back up, and the codes an app holds when it crashes are lost, like a wasted block.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "maker", label: "Key maker", kind: "worker", sub: "runs all day", x: 70, y: 100 },
      { id: "pool", label: "Key pool", kind: "database", sub: "unused: 0", x: 350, y: 100 },
      { id: "app", label: "App", kind: "server", sub: "needs codes", x: 350, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 1.0, from: "maker", to: "pool", label: "17M random codes" },
      { kind: "say", at: 1.2, actor: "pool", text: "unused: 17M", tone: "accent" },
      { kind: "fly", at: 2.0, dur: 0.9, from: "app", to: "pool", label: "take 1,000" },
      { kind: "say", at: 2.9, actor: "pool", text: "1,000 used", tone: "warn" },
      { kind: "fly", at: 3.0, dur: 0.9, from: "pool", to: "app", label: "1,000 codes" },
      { kind: "say", at: 3.9, actor: "app", text: "has 1,000 codes", tone: "good" },
      { kind: "verdict", at: 4.1, text: "Random, and ready before needed", tone: "good" },
    ],
    loop: 7.5,
  },
};
