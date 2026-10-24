import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 22.3 beat 4: drain a gateway before stopping it, so its phones come back spread over time.
export const sysdesignM22DrainGateway: SceneSpec = {
  kind: "scene",
  title: "Drain a gateway: phones move at random times",
  purpose: "Before a restart, Gateway 2 tells its phones to reconnect after a random wait. They come back one by one through the balancer, and the gateway stops only when it is empty.",
  limits: "The picture shows a few phones as one card. In a real drain, 50,000 phones each pick their own wait, for example anywhere from 0 to 30 seconds, so arrivals are spread out.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "phones", label: "Phones", kind: "phone", sub: "50,000 lines", x: 70, y: 100 },
      { id: "old", label: "Gateway 2", kind: "router", sub: "must restart", x: 350, y: 100 },
      { id: "lb", label: "Balancer", kind: "router", sub: "picks a gateway", x: 70, y: 235 },
      { id: "new", label: "Gateway 5", kind: "router", sub: "has room", x: 350, y: 235 },
    ],
    events: [
      { kind: "say", at: 0.2, actor: "old", text: "draining", tone: "warn" },
      { kind: "fly", at: 0.4, dur: 0.9, from: "old", to: "phones", label: "move later", tone: "warn" },
      { kind: "say", at: 1.3, actor: "phones", text: "waits 0 to 30 s", tone: "accent" },
      { kind: "fly", at: 2.0, dur: 0.9, from: "phones", to: "lb", label: "connect" },
      { kind: "fly", at: 2.9, dur: 0.9, from: "lb", to: "new", label: "one phone" },
      { kind: "say", at: 3.8, actor: "new", text: "takes it", tone: "good" },
      { kind: "fly", at: 4.1, dur: 0.9, from: "phones", to: "lb", label: "connect" },
      { kind: "fly", at: 5.0, dur: 0.9, from: "lb", to: "new", label: "next phone" },
      { kind: "say", at: 5.9, actor: "old", text: "0 lines: stop", tone: "good" },
      { kind: "say", at: 6.0, actor: "phones", text: "all moved", tone: "good" },
      { kind: "verdict", at: 6.1, text: "Spread out, then stop the gateway", tone: "good" },
    ],
    loop: 9.2,
  },
};
