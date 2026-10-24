import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Beat 2 of 1.3: the front door. The gateway checks each caller and its
// rate; the load balancer spreads accepted requests over two app servers.
// A script over its limit gets 429 Too Many Requests.
export const sysdesignM1FrontDoor: SceneSpec = {
  kind: "scene",
  title: "The front door: a gateway checks, a load balancer spreads",
  purpose: "Two requests pass the gateway and the load balancer sends one to each app server; a script over its limit gets 429.",
  limits: "The load balancer takes turns (round robin), one of several ways to choose. The script's limit is illustrative. Many systems put the load balancer first and the gateway behind it, or use one product for both jobs.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "student", x: 60, y: 100 },
      { id: "gateway", label: "Gateway", kind: "router", sub: "checks callers", x: 210, y: 100 },
      { id: "lb", label: "Balancer", kind: "router", sub: "spreads load", x: 360, y: 100 },
      { id: "script", label: "Script", kind: "worker", sub: "100s per sec", x: 60, y: 230 },
      { id: "app1", label: "App 1", kind: "server", sub: "ready", x: 230, y: 230 },
      { id: "app2", label: "App 2", kind: "server", sub: "ready", x: 360, y: 230 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 0.7, from: "phone", to: "gateway", label: "GET /notes" },
      { kind: "say", at: 0.7, actor: "gateway", text: "key OK", tone: "good" },
      { kind: "fly", at: 0.8, dur: 0.6, from: "gateway", to: "lb", label: "pass" },
      { kind: "fly", at: 1.4, dur: 0.7, from: "lb", to: "app1", label: "to App 1" },
      { kind: "say", at: 2.1, actor: "app1", text: "serving", tone: "good" },

      { kind: "fly", at: 2.4, dur: 0.7, from: "phone", to: "gateway", label: "GET /note/42" },
      { kind: "fly", at: 3.2, dur: 0.6, from: "gateway", to: "lb", label: "pass" },
      { kind: "fly", at: 3.8, dur: 0.7, from: "lb", to: "app2", label: "to App 2" },
      { kind: "say", at: 4.5, actor: "app2", text: "serving", tone: "good" },

      { kind: "fly", at: 4.6, dur: 0.7, from: "script", to: "gateway", label: "request 101" },
      { kind: "say", at: 5.3, actor: "gateway", text: "over limit", tone: "bad" },
      { kind: "fly", at: 5.4, dur: 0.7, from: "gateway", to: "script", label: "429", tone: "bad" },
      { kind: "say", at: 6.1, actor: "script", text: "told to slow", tone: "warn" },
      { kind: "verdict", at: 6.3, text: "Front door: check, limit, spread", tone: "accent" },
    ],
    loop: 9.3,
  },
};
