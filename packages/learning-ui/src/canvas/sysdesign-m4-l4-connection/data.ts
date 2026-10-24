import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 4.4: a layer 4 balancer picks a server when the connection opens, by a hash
// of addresses and ports, and every request on that connection goes there.
export const sysdesignM4L4Connection: SceneSpec = {
  kind: "scene",
  title: "Layer 4: one connection, one server",
  purpose: "The balancer sees a new TCP connection, hashes its addresses and ports, and picks App 2. Every request on that connection then goes to App 2.",
  limits: "One phone with one long-lived connection, so the effect is extreme. With thousands of clients the hash spreads connections well; the trouble is a few long, busy connections. The balancer here cannot see paths or cookies, only addresses and ports.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "1 connection", x: 62, y: 170 },
      { id: "lb", label: "Balancer", kind: "router", sub: "layer 4", x: 210, y: 170 },
      { id: "app1", label: "App 1", kind: "server", sub: "idle", x: 358, y: 90 },
      { id: "app2", label: "App 2", kind: "server", sub: "idle", x: 358, y: 170 },
      { id: "app3", label: "App 3", kind: "server", sub: "idle", x: 358, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.6, from: "phone", to: "lb", label: "open conn" },
      { kind: "say", at: 0.8, actor: "lb", text: "hash: App 2" },
      { kind: "mark", at: 0.8, actor: "app2", tone: "accent" },
      { kind: "fly", at: 1, dur: 0.6, from: "lb", to: "app2", label: "conn" },
      { kind: "fly", at: 1.8, dur: 0.5, from: "phone", to: "lb", label: "req 1" },
      { kind: "fly", at: 2.3, dur: 0.5, from: "lb", to: "app2", label: "req 1" },
      { kind: "say", at: 2.8, actor: "app2", text: "1 request" },
      { kind: "fly", at: 2.9, dur: 0.5, from: "phone", to: "lb", label: "req 2" },
      { kind: "fly", at: 3.4, dur: 0.5, from: "lb", to: "app2", label: "req 2" },
      { kind: "say", at: 3.9, actor: "app2", text: "2 requests" },
      { kind: "fly", at: 4, dur: 0.5, from: "phone", to: "lb", label: "req 3" },
      { kind: "fly", at: 4.5, dur: 0.5, from: "lb", to: "app2", label: "req 3" },
      { kind: "say", at: 5, actor: "app2", text: "3 requests", tone: "warn" },
      { kind: "say", at: 5, actor: "app1", text: "still idle", tone: "warn" },
      { kind: "say", at: 5, actor: "app3", text: "still idle", tone: "warn" },
      { kind: "verdict", at: 5.2, text: "L4: one connection, one server", tone: "warn" },
    ],
    loop: 8.2,
  },
};
