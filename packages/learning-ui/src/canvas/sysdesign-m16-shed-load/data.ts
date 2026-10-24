import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 16.5 beat 5 (Refuse early, serve well).
export const sysdesignM16ShedLoad: SceneSpec = {
  kind: "scene",
  title: "Load shedding: refuse the extra, serve the rest on time",
  purpose: "150 requests a second arrive at a server that can do 100. First every request waits in one long line and answers come late. Then the server refuses the extra 50 at once and answers the other 100 on time.",
  limits: "Steady rates and one queue. Real shedding picks by priority or by client (Stripe runs shedders for fleet usage and worker use). The 150 and 100 are course numbers.",
  scene: {
    width: 420,
    height: 190,
    actors: [
      { id: "phones", label: "Phones", kind: "phone", sub: "150 req/s", x: 60, y: 100 },
      { id: "server", label: "Server", kind: "server", sub: "room for 100/s", x: 210, y: 100 },
      { id: "line", label: "Line", kind: "queue", sub: "line: 0", x: 360, y: 100 }
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "phones", to: "server", label: "150/s" },
      { kind: "fly", at: 1.2, dur: 0.8, from: "server", to: "line", label: "extra waits" },
      { kind: "say", at: 2.1, actor: "line", text: "line: 100+", tone: "warn" },
      { kind: "say", at: 2.4, actor: "server", text: "answers late", tone: "bad" },
      { kind: "mark", at: 2.4, actor: "server", tone: "bad" },
      { kind: "say", at: 3.6, actor: "server", text: "shed the extra", tone: "accent" },
      { kind: "say", at: 3.6, actor: "line", text: "line: 0", tone: "good" },
      { kind: "fly", at: 3.9, dur: 0.9, from: "server", to: "phones", label: "busy 503", tone: "warn" },
      { kind: "say", at: 4.9, actor: "server", text: "100/s on time", tone: "good" },
      { kind: "verdict", at: 5.2, text: "Refuse 50 early, serve 100 well", tone: "good" }
    ],
    loop: 8.2,
  },
};
