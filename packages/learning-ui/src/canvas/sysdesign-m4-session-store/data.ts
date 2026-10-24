import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 4.3: a shared session store. App 1 saves Hana's session in Valkey; App 2
// reads it back on her next request, so any server can serve her.
export const sysdesignM4SessionStore: SceneSpec = {
  kind: "scene",
  title: "The session lives in a store every server can read",
  purpose: "App 1 saves Hana's session in a shared store and sends her only a session id. Her next request lands on App 2, which reads the session from the store and serves her.",
  limits: "One store, drawn as never failing. In practice the store is now a part every request depends on: it needs a replica, and each request pays one extra round trip to it, about half a millisecond inside a data centre. The store's name, Valkey, is one open-source choice; Redis and a database table work too.",
  scene: {
    width: 420,
    height: 260,
    actors: [
      { id: "hana", label: "Hana", kind: "phone", sub: "logging in", x: 62, y: 95 },
      { id: "lb", label: "Balancer", kind: "router", sub: "round robin", x: 62, y: 215 },
      { id: "app1", label: "App 1", kind: "server", sub: "stateless", x: 210, y: 95 },
      { id: "app2", label: "App 2", kind: "server", sub: "stateless", x: 210, y: 215 },
      { id: "store", label: "Valkey", kind: "cache", sub: "sessions", x: 358, y: 155 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.6, from: "hana", to: "lb", label: "log in" },
      { kind: "fly", at: 0.8, dur: 0.6, from: "lb", to: "app1", label: "log in" },
      { kind: "fly", at: 1.4, dur: 0.6, from: "app1", to: "store", label: "save session" },
      { kind: "say", at: 2, actor: "store", text: "Hana's session", tone: "good" },
      { kind: "fly", at: 2, dur: 0.5, from: "app1", to: "lb", label: "session id", tone: "good" },
      { kind: "fly", at: 2.5, dur: 0.5, from: "lb", to: "hana", label: "session id", tone: "good" },
      { kind: "say", at: 3, actor: "hana", text: "logged in", tone: "good" },
      { kind: "fly", at: 3.5, dur: 0.5, from: "hana", to: "lb", label: "my notes" },
      { kind: "fly", at: 4, dur: 0.6, from: "lb", to: "app2", label: "my notes" },
      { kind: "fly", at: 4.6, dur: 0.5, from: "app2", to: "store", label: "session?" },
      { kind: "fly", at: 5.1, dur: 0.5, from: "store", to: "app2", label: "Hana", tone: "good" },
      { kind: "say", at: 5.6, actor: "app2", text: "Hana: served", tone: "good" },
      { kind: "fly", at: 5.8, dur: 0.5, from: "app2", to: "lb", label: "notes", tone: "good" },
      { kind: "fly", at: 6.3, dur: 0.5, from: "lb", to: "hana", label: "notes", tone: "good" },
      { kind: "say", at: 6.8, actor: "hana", text: "still logged in", tone: "good" },
      { kind: "verdict", at: 7, text: "Any server can serve her now", tone: "good" },
    ],
    loop: 10,
  },
};
