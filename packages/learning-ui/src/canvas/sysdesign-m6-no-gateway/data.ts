import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 6.6 beat 1: no gateway. The phone calls three services directly; each one
// repeats the same checks, and the search team forgot the rate limit.
export const sysdesignM6NoGateway: SceneSpec = {
  kind: "scene",
  title: "Every service guarding its own door",
  purpose: "Books and payments each run their own TLS, token and rate limit checks; search forgot its rate limit, so that door is open to a flood.",
  limits: "'3 checks' stands for ending TLS, checking the token and counting requests. Three services stand for many; the forgotten limit is a made-up example of how copies drift.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "calls each one", x: 60, y: 180 },
      { id: "books", label: "Books", kind: "server", sub: "own checks", x: 330, y: 90 },
      { id: "search", label: "Search", kind: "server", sub: "own checks", x: 330, y: 180 },
      { id: "payments", label: "Payments", kind: "server", sub: "own checks", x: 330, y: 270 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "phone", to: "books", label: "GET /books/42" },
      { kind: "say", at: 0.9, actor: "books", text: "3 checks: OK", tone: "good" },
      { kind: "fly", at: 1.2, dur: 0.7, from: "phone", to: "payments", label: "POST /payments" },
      { kind: "say", at: 1.9, actor: "payments", text: "3 checks: OK", tone: "good" },
      { kind: "fly", at: 2.2, dur: 0.7, from: "phone", to: "search", label: "GET /search" },
      { kind: "say", at: 2.9, actor: "search", text: "forgot limit", tone: "bad" },
      { kind: "mark", at: 2.9, actor: "search", tone: "bad" },
      { kind: "verdict", at: 3.2, text: "Same checks 3 times; one was missed", tone: "bad" },
    ],
    loop: 6.2,
  },
};
