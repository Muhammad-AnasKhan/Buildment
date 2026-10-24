import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 6.5 beat 1: a script sends 12 searches at once against a limit of 5 a
// second per client; 5 are served, 7 get 429. Huda's own search still works.
export const sysdesignM6Limit429: SceneSpec = {
  kind: "scene",
  title: "Too many requests: answer 429",
  purpose: "The limiter serves the script's first 5 searches, answers the other 7 with 429 and Retry-After, and still serves Huda, who has her own count.",
  limits: "The limit of 5 searches a second per client is a made-up Kitabi setting. The picture does not show how the limiter counts; the rest of the chapter compares five ways.",
  scene: {
    width: 420,
    height: 260,
    actors: [
      { id: "script", label: "Script", kind: "worker", sub: "12 at once", x: 60, y: 200 },
      { id: "api", label: "Search API", kind: "server", sub: "5 a sec each", x: 210, y: 100 },
      { id: "huda", label: "Huda", kind: "phone", sub: "searching", x: 360, y: 200 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "script", to: "api", label: "12 searches" },
      { kind: "say", at: 1.0, actor: "api", text: "script: 5 of 5", tone: "warn" },
      { kind: "fly", at: 1.2, dur: 0.7, from: "api", to: "script", label: "5 x 200", tone: "good" },
      { kind: "fly", at: 2.0, dur: 0.7, from: "api", to: "script", label: "7 x 429", tone: "bad" },
      { kind: "say", at: 2.7, actor: "script", text: "Retry-After: 1", tone: "bad" },
      { kind: "mark", at: 2.7, actor: "script", tone: "bad" },
      { kind: "fly", at: 3.0, dur: 0.7, from: "huda", to: "api", label: "search" },
      { kind: "say", at: 3.7, actor: "api", text: "Huda: 1 of 5", tone: "good" },
      { kind: "fly", at: 3.9, dur: 0.7, from: "api", to: "huda", label: "200 results", tone: "good" },
      { kind: "say", at: 4.6, actor: "huda", text: "got results", tone: "good" },
      { kind: "verdict", at: 4.8, text: "Script told 429; Huda still served", tone: "good" },
    ],
    loop: 7.8,
  },
};
