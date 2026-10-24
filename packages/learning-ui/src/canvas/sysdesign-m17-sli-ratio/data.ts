import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 17.3 beat 3 (Good over valid).
export const sysdesignM17SliRatio: SceneSpec = {
  kind: "scene",
  title: "Customers send four requests, and the counter shows good over valid",
  purpose: "Two orders succeed, one fails with a server error, and one asks for a page that does not exist. The server error counts against the SLI. The 404 is the caller's mistake and is not counted.",
  limits: "Four requests, so the SLI is 2 of 3. Real SLIs use millions of requests, and teams choose for themselves which statuses are valid. Some teams count a request as bad when it is too slow, not only when it fails.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "customers", label: "Customers", kind: "phone", sub: "4 requests", x: 60, y: 100 },
      { id: "api", label: "Api", kind: "server", sub: "answers", x: 360, y: 100 },
      { id: "counter", label: "Counter", kind: "note", sub: "good 0 of 0", x: 210, y: 220 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1.3, from: "customers", to: "api", label: "order", tone: "good" },
      { kind: "say", at: 1.6, actor: "counter", text: "good 1 of 1", tone: "good" },
      { kind: "fly", at: 2, dur: 1.3, from: "customers", to: "api", label: "order", tone: "good" },
      { kind: "say", at: 3.3, actor: "counter", text: "good 2 of 2", tone: "good" },
      { kind: "fly", at: 3.7, dur: 1.3, from: "customers", to: "api", label: "503 error", tone: "bad" },
      { kind: "say", at: 5, actor: "counter", text: "good 2 of 3", tone: "warn" },
      { kind: "fly", at: 5.4, dur: 1.3, from: "customers", to: "api", label: "404 not found", tone: "accent" },
      { kind: "say", at: 6.7, actor: "counter", text: "404 not counted", tone: "accent" },
      { kind: "verdict", at: 7.3, text: "SLI = good / valid = 2 of 3", tone: "warn" },
    ],
    loop: 10.5,
  },
};
