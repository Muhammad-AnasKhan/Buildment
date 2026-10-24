import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.4 beat 3 (A Service finds pods by label).
export const sysdesignM18ServiceLabels: SceneSpec = {
  kind: "scene",
  title: "A Service sends traffic only to pods with the right label",
  purpose: "The Service picks every pod labelled app=daftar-api. Pod C has another label, so it never gets a request.",
  limits: "Only pods that are ready are in the list. The Service has one stable name and address; the pods behind it come and go. Traffic is spread over the pods, not always in strict turns.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "users", label: "Users", kind: "user", x: 60, y: 145 },
      { id: "svc", label: "Service", kind: "router", sub: "app=daftar-api", x: 210, y: 145 },
      { id: "a", label: "Pod A", kind: "server", sub: "app=daftar-api", x: 360, y: 80 },
      { id: "b", label: "Pod B", kind: "server", sub: "app=daftar-api", x: 360, y: 145 },
      { id: "c", label: "Pod C", kind: "server", sub: "app=cleanup", x: 360, y: 210 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "users", to: "svc", label: "request" },
      { kind: "fly", at: 1.1, dur: 0.7, from: "svc", to: "a", label: "to A" },
      { kind: "fly", at: 2.2, dur: 0.7, from: "users", to: "svc", label: "request" },
      { kind: "fly", at: 3, dur: 0.7, from: "svc", to: "b", label: "to B" },
      { kind: "say", at: 3.9, actor: "c", text: "no traffic", tone: "warn" },
      { kind: "verdict", at: 4.2, text: "Only pods with the label get traffic", tone: "good" },
    ],
    loop: 7.2,
  },
};
