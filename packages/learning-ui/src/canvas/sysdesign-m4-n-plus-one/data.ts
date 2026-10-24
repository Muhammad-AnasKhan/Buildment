import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 4.2: N+1. 400 requests a second on servers that do 100 each. Five servers
// run at 80%; lose one and four run at 100%. Six would leave five at 80%.
export const sysdesignM4NPlusOne: SceneSpec = {
  kind: "scene",
  title: "Five servers are enough until one fails",
  purpose: "Five servers carry 400 requests a second at 80%. One fails and the other four are full. Planning for one down means six.",
  limits: "Servers of 100 requests a second each and a steady 400 a second, made-up round numbers. The balancer is assumed to move traffic at once. At exactly 100% busy a queue grows without limit (chapter 2.5), so \"full\" here means requests start to time out.",
  scene: {
    width: 420,
    height: 200,
    actors: [
      { id: "students", label: "Students", kind: "user", sub: "400/s", x: 62, y: 120 },
      { id: "lb", label: "Balancer", kind: "router", sub: "5 servers", x: 210, y: 120 },
      { id: "fleet", label: "Servers", kind: "server", sub: "5 at 80%", x: 358, y: 120 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "students", to: "lb", label: "400/s" },
      { kind: "fly", at: 0.9, dur: 0.7, from: "lb", to: "fleet", label: "80/s each" },
      { kind: "say", at: 1.6, actor: "fleet", text: "5 at 80%", tone: "good" },
      { kind: "say", at: 2.2, actor: "fleet", text: "1 failed", tone: "bad" },
      { kind: "mark", at: 2.2, actor: "fleet", tone: "bad" },
      { kind: "say", at: 2.4, actor: "lb", text: "4 servers", tone: "warn" },
      { kind: "fly", at: 2.8, dur: 0.7, from: "students", to: "lb", label: "400/s" },
      { kind: "fly", at: 3.5, dur: 0.7, from: "lb", to: "fleet", label: "100/s each" },
      { kind: "say", at: 4.2, actor: "fleet", text: "4 at 100%", tone: "bad" },
      { kind: "say", at: 4.4, actor: "students", text: "line grows", tone: "bad" },
      { kind: "say", at: 5.2, actor: "lb", text: "plan: 6", tone: "good" },
      { kind: "say", at: 5.2, actor: "fleet", text: "5 left at 80%", tone: "good" },
      { kind: "mark", at: 5.2, actor: "fleet", tone: "good" },
      { kind: "verdict", at: 5.4, text: "Need N+1: 6 servers, not 5", tone: "good" },
    ],
    loop: 8.4,
  },
};
