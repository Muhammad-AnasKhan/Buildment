import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 2.5 beat 3: M/M/1 mean time in system W = 1 / (mu - lambda). Service time
// 10 ms (mu = 100/s): idle 10 ms, 50% busy 20 ms, 90% 100 ms, 99% 1,000 ms.
export const sysdesignM2UtilisationKnee: SceneSpec = {
  kind: "scene",
  title: "The wait explodes as the server fills up",
  purpose: "Arrivals rise toward the server's capacity of 100 per second, and the average time each request spends in the system jumps near the top.",
  limits: "The M/M/1 queue model: random arrivals, random service times, one server. Real systems do not match it exactly, so read it for the shape (the knee), not for exact numbers.",
  scene: {
    width: 420,
    height: 310,
    actors: [
      { id: "users", kind: "user", label: "Users", sub: "50 per second", x: 60, y: 110 },
      { id: "server", kind: "server", label: "Server", sub: "10 ms each", x: 360, y: 110 },
    ],
    strip: { y: 280, from: 0, to: 100, unit: "%", caption: "how busy the server is", every: 25 },
    events: [
      { kind: "tag", at: 0.2, row: 0, value: 0, label: "idle: 10 ms", tone: "good" },
      { kind: "fly", at: 0.3, dur: 0.8, from: "users", to: "server", label: "50/s" },
      { kind: "say", at: 1.1, actor: "server", text: "50% busy" },
      { kind: "tag", at: 1.1, row: 1, value: 50, label: "50%: 20 ms" },
      { kind: "say", at: 1.8, actor: "users", text: "90 per second" },
      { kind: "fly", at: 1.8, dur: 0.8, from: "users", to: "server", label: "90/s" },
      { kind: "say", at: 2.6, actor: "server", text: "90% busy", tone: "warn" },
      { kind: "tag", at: 2.6, row: 0, value: 90, label: "90%: 100 ms", tone: "warn" },
      { kind: "say", at: 3.3, actor: "users", text: "99 per second" },
      { kind: "fly", at: 3.3, dur: 0.8, from: "users", to: "server", label: "99/s" },
      { kind: "say", at: 4.1, actor: "server", text: "99% busy", tone: "bad" },
      { kind: "mark", at: 4.1, actor: "server", tone: "bad" },
      { kind: "tag", at: 4.1, row: 1, value: 99, label: "99%: 1,000 ms", tone: "bad" },
      { kind: "verdict", at: 4.4, text: "At 99% busy: 100x the service time", tone: "bad" },
    ],
    loop: 7.6,
  },
};
