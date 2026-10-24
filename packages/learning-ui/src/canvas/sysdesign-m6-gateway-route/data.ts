import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 6.6 beat 2: one gateway checks the token and the rate limit once, then
// routes by path: /books to the books service, /payments to payments.
export const sysdesignM6GatewayRoute: SceneSpec = {
  kind: "scene",
  title: "One door in front of many services",
  purpose: "Two requests pass the same token and limit checks at the gateway, then go to different services by their path.",
  limits: "The gateway's extra hop costs about 50 microseconds (napkin-math), far too little to see here; the picture is slowed down. One gateway copy is drawn; in practice several run behind a load balancer.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "Kitabi app", x: 60, y: 180 },
      { id: "gateway", label: "Gateway", kind: "router", sub: "front door", x: 210, y: 180 },
      { id: "books", label: "Books", kind: "server", sub: "no checks", x: 360, y: 100 },
      { id: "payments", label: "Payments", kind: "server", sub: "no checks", x: 360, y: 260 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "phone", to: "gateway", label: "GET /books/42" },
      { kind: "say", at: 0.9, actor: "gateway", text: "token OK", tone: "good" },
      { kind: "say", at: 1.3, actor: "gateway", text: "limit OK", tone: "good" },
      { kind: "fly", at: 1.5, dur: 0.6, from: "gateway", to: "books", label: "/books" },
      { kind: "say", at: 2.1, actor: "books", text: "serving", tone: "good" },
      { kind: "fly", at: 2.3, dur: 0.6, from: "books", to: "gateway", label: "book 42" },
      { kind: "fly", at: 2.9, dur: 0.6, from: "gateway", to: "phone", label: "book 42" },
      { kind: "fly", at: 3.6, dur: 0.7, from: "phone", to: "gateway", label: "POST /payments" },
      { kind: "say", at: 4.3, actor: "gateway", text: "token, limit OK", tone: "good" },
      { kind: "fly", at: 4.5, dur: 0.6, from: "gateway", to: "payments", label: "/payments" },
      { kind: "say", at: 5.1, actor: "payments", text: "serving", tone: "good" },
      { kind: "verdict", at: 5.3, text: "Check once at the door, then route", tone: "good" },
    ],
    loop: 8.3,
  },
};
