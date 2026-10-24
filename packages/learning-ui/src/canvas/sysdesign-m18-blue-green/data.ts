import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.6 beat 2 (Blue-green: switch the router).
export const sysdesignM18BlueGreen: SceneSpec = {
  kind: "scene",
  title: "Blue-green switches all traffic at once, and switches back",
  purpose: "Blue runs v1 for users. Green runs v2 and is tested. The router switches to green. When green shows errors, the router switches back to blue.",
  limits: "You pay for two full environments during the switch. A database shared by both must work with both versions, so schema changes are deployed separately. Users with open requests at the moment of the switch can see errors.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "users", label: "Users", kind: "user", x: 60, y: 145 },
      { id: "router", label: "Router", kind: "router", sub: "to blue", x: 210, y: 145 },
      { id: "blue", label: "Blue", kind: "server", sub: "v1 live", x: 360, y: 95 },
      { id: "green", label: "Green", kind: "server", sub: "v2 tested", x: 360, y: 195 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.6, from: "users", to: "router", label: "request" },
      { kind: "fly", at: 0.9, dur: 0.6, from: "router", to: "blue", label: "to blue" },
      { kind: "say", at: 1.8, actor: "router", text: "to green", tone: "accent" },
      { kind: "say", at: 1.8, actor: "green", text: "v2 live", tone: "accent" },
      { kind: "fly", at: 2.4, dur: 0.6, from: "users", to: "router", label: "request" },
      { kind: "fly", at: 3, dur: 0.6, from: "router", to: "green", label: "to green" },
      { kind: "say", at: 3.8, actor: "green", text: "5xx errors", tone: "bad" },
      { kind: "say", at: 4.3, actor: "router", text: "back to blue", tone: "warn" },
      { kind: "say", at: 4.3, actor: "blue", text: "v1 live", tone: "good" },
      { kind: "verdict", at: 4.7, text: "Rollback is flipping the switch", tone: "good" },
    ],
    loop: 7.7,
  },
};
