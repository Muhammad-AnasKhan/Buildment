import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 22.4 beat 6: presence is a key with a time limit that every heartbeat renews.
export const sysdesignM22PresenceBeat: SceneSpec = {
  kind: "scene",
  title: "Online is a key that expires unless renewed",
  purpose: "Sami's app sends a heartbeat every 30 seconds. Each one renews a 60 second key in the presence store. When the phone goes silent the key runs out, and Layla sees Sami as offline.",
  limits: "The silence is drawn as a few seconds so it fits the picture. In real time it is 60 seconds. The 30 and 60 second numbers are course numbers; the next playable lets you change the 30.",
  scene: {
    width: 420,
    height: 340,
    actors: [
      { id: "sami", label: "Sami", kind: "phone", sub: "pings each 30 s", x: 70, y: 100 },
      { id: "pres", label: "Presence", kind: "cache", sub: "no key", x: 350, y: 100 },
      { id: "layla", label: "Layla", kind: "phone", sub: "looks at Sami", x: 350, y: 245 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "sami", to: "pres", label: "ping" },
      { kind: "say", at: 1.2, actor: "pres", text: "alive for 60 s", tone: "good" },
      { kind: "fly", at: 1.6, dur: 0.9, from: "sami", to: "pres", label: "ping" },
      { kind: "say", at: 2.5, actor: "pres", text: "renewed: 60 s", tone: "good" },
      { kind: "mark", at: 2.8, actor: "sami", tone: "bad" },
      { kind: "say", at: 2.8, actor: "sami", text: "signal lost", tone: "bad" },
      { kind: "wait", at: 3.0, dur: 2.0, actor: "sami", label: "silent {n} s", doneLabel: "silent 60 s", total: 60 },
      { kind: "say", at: 5.1, actor: "pres", text: "key expired", tone: "bad" },
      { kind: "fly", at: 5.4, dur: 0.8, from: "layla", to: "pres", label: "is Sami on?" },
      { kind: "fly", at: 6.3, dur: 0.8, from: "pres", to: "layla", label: "offline", tone: "warn" },
      { kind: "say", at: 7.1, actor: "layla", text: "Sami: offline", tone: "warn" },
      { kind: "verdict", at: 7.2, text: "60 s of silence means offline", tone: "warn" },
    ],
    loop: 10.2,
  },
};
