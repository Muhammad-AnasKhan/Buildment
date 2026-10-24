import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 4.4: a layer 7 balancer reads every request. It takes turns for GET /notes
// and sends POST /upload to the upload servers by a path rule.
export const sysdesignM4L7Request: SceneSpec = {
  kind: "scene",
  title: "Layer 7: every request is a new choice",
  purpose: "On the same connection, the balancer reads each request: two GET /notes go to App 1 and App 2 in turn, and POST /upload follows a path rule to the upload server.",
  limits: "The balancer must end the client's connection and open its own to the servers to read requests, which costs it more work per request than L4. Encryption (TLS) must end at the balancer for it to read the path; the picture skips that.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "1 connection", x: 62, y: 170 },
      { id: "lb", label: "Balancer", kind: "router", sub: "layer 7", x: 210, y: 170 },
      { id: "app1", label: "App 1", kind: "server", sub: "notes", x: 358, y: 90 },
      { id: "app2", label: "App 2", kind: "server", sub: "notes", x: 358, y: 170 },
      { id: "up", label: "Uploads", kind: "server", sub: "files", x: 358, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.6, from: "phone", to: "lb", label: "GET /notes" },
      { kind: "say", at: 0.8, actor: "lb", text: "turn: App 1" },
      { kind: "fly", at: 1, dur: 0.6, from: "lb", to: "app1", label: "GET /notes" },
      { kind: "say", at: 1.6, actor: "app1", text: "served", tone: "good" },
      { kind: "fly", at: 2, dur: 0.6, from: "phone", to: "lb", label: "GET /notes" },
      { kind: "say", at: 2.6, actor: "lb", text: "turn: App 2" },
      { kind: "fly", at: 2.8, dur: 0.6, from: "lb", to: "app2", label: "GET /notes" },
      { kind: "say", at: 3.4, actor: "app2", text: "served", tone: "good" },
      { kind: "fly", at: 3.8, dur: 0.6, from: "phone", to: "lb", label: "POST /upload" },
      { kind: "say", at: 4.4, actor: "lb", text: "rule: /upload" },
      { kind: "fly", at: 4.6, dur: 0.6, from: "lb", to: "up", label: "POST /upload" },
      { kind: "say", at: 5.2, actor: "up", text: "stored", tone: "good" },
      { kind: "verdict", at: 5.4, text: "L7: every request is a new choice", tone: "good" },
    ],
    loop: 8.4,
  },
};
