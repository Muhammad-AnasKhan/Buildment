import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 4.5: least connections. The balancer counts requests in flight per server
// and sends each new one to the smallest count.
export const sysdesignM4LeastBusy: SceneSpec = {
  kind: "scene",
  title: "Each request goes to the least busy server",
  purpose: "The balancer keeps a count of requests in flight on each server. Each new request goes to the smallest count, so busy A gets nothing new until it catches up.",
  limits: "The counts are exact because one balancer sees every request. With several balancers, each sees only its own requests. A tie goes to the first server in the list.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "lb", label: "Balancer", kind: "router", sub: "least busy", x: 62, y: 170 },
      { id: "a", label: "A", kind: "server", sub: "3 in flight", x: 358, y: 90 },
      { id: "b", label: "B", kind: "server", sub: "0 in flight", x: 358, y: 170 },
      { id: "c", label: "C", kind: "server", sub: "1 in flight", x: 358, y: 250 },
    ],
    events: [
      { kind: "say", at: 0.3, actor: "lb", text: "A3 B0 C1: B" },
      { kind: "fly", at: 0.8, dur: 0.6, from: "lb", to: "b", label: "page" },
      { kind: "say", at: 1.4, actor: "b", text: "1 in flight" },
      { kind: "say", at: 1.8, actor: "lb", text: "A3 B1 C1: B" },
      { kind: "fly", at: 2.2, dur: 0.6, from: "lb", to: "b", label: "page" },
      { kind: "say", at: 2.8, actor: "b", text: "2 in flight" },
      { kind: "fly", at: 2.9, dur: 0.6, from: "a", to: "lb", label: "done", tone: "good" },
      { kind: "say", at: 3, actor: "a", text: "2 in flight" },
      { kind: "say", at: 3.6, actor: "lb", text: "A2 B2 C1: C" },
      { kind: "fly", at: 4, dur: 0.6, from: "lb", to: "c", label: "page" },
      { kind: "say", at: 4.6, actor: "c", text: "2 in flight", tone: "good" },
      { kind: "verdict", at: 4.8, text: "Each request goes to the least busy", tone: "good" },
    ],
    loop: 7.8,
  },
};
