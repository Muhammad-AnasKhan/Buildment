import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 6.6 beat 3: the gateway knows Huda from her token but not who owns order
// 512. It passes her id on; the orders service checks the owner: 404.
export const sysdesignM6OwnershipCheck: SceneSpec = {
  kind: "scene",
  title: "Business rules stay with the data",
  purpose: "The gateway checks Huda's token and passes her id on; only the orders service knows order 512 is Omar's, so it answers 404.",
  limits: "One gateway and one service are drawn. 404 instead of 403 is a choice that hides whether order 512 exists; both refuse the request.",
  scene: {
    width: 420,
    height: 220,
    actors: [
      { id: "phone", label: "Huda", kind: "phone", sub: "logged in", x: 60, y: 150 },
      { id: "gateway", label: "Gateway", kind: "router", sub: "front door", x: 210, y: 150 },
      { id: "orders", label: "Orders", kind: "server", sub: "owns orders", x: 360, y: 150 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "phone", to: "gateway", label: "GET /orders/512" },
      { kind: "say", at: 0.9, actor: "gateway", text: "token OK: Huda", tone: "good" },
      { kind: "fly", at: 1.1, dur: 0.7, from: "gateway", to: "orders", label: "user=huda, 512" },
      { kind: "say", at: 1.8, actor: "orders", text: "512 is Omar's", tone: "bad" },
      { kind: "fly", at: 2.1, dur: 0.6, from: "orders", to: "gateway", label: "404", tone: "bad" },
      { kind: "fly", at: 2.7, dur: 0.6, from: "gateway", to: "phone", label: "404 not found", tone: "bad" },
      { kind: "say", at: 3.3, actor: "phone", text: "not hers", tone: "bad" },
      { kind: "verdict", at: 3.5, text: "Orders service said no: not hers", tone: "good" },
    ],
    loop: 6.5,
  },
};
