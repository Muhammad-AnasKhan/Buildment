import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 2.5 beat 4: Little's law, L = lambda x W. 200 requests per second, each in
// the server for 50 ms (0.05 s), so on average 10 are inside at any moment.
const arrivals = Array.from({ length: 8 }, (_, i) => ({
  kind: "fly" as const, at: 0.3 + i * 0.3, dur: 1.0, from: "users", to: "server", label: "req",
}));
const replies = Array.from({ length: 6 }, (_, i) => ({
  kind: "fly" as const, at: 1.6 + i * 0.3, dur: 1.0, from: "server", to: "users", label: "done", tone: "good" as const,
}));

export const sysdesignM2LittlesLaw: SceneSpec = {
  kind: "scene",
  title: "Arrival rate times time inside gives the crowd",
  purpose: "Requests stream in at 200 per second and each stays 50 ms, so the server holds about 10 at any moment.",
  limits: "The rate and time are made-up round numbers. Little's law itself needs no assumptions about how requests arrive or how long each one takes; it holds for averages over any long enough window. Only a few requests are drawn.",
  scene: {
    width: 420,
    height: 200,
    actors: [
      { id: "users", kind: "user", label: "Users", sub: "200 per second", x: 60, y: 120 },
      { id: "server", kind: "server", label: "Server", sub: "50 ms each", x: 360, y: 120 },
    ],
    events: [
      ...arrivals,
      ...replies,
      { kind: "say", at: 3.6, actor: "server", text: "10 inside", tone: "good" },
      { kind: "mark", at: 3.6, actor: "server", tone: "good" },
      { kind: "verdict", at: 3.9, text: "L = 200/s × 0.05 s = 10", tone: "good" },
    ],
    loop: 7,
  },
};
