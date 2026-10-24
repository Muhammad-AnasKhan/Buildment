import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 12.9 beat 3 (A watch tells the client).
export const sysdesignM12RegistryWatch: SceneSpec = {
  kind: "scene",
  title: "A client watches the registry and is told when a service appears or goes",
  purpose: "The client asks to watch /pay. When payments-2 registers, the registry pushes an event. When payments-2 crashes and its lease expires, the registry pushes a second event.",
  limits: "One watcher, one instance and a lease that is never renewed after the crash. etcd says a watch event arrives in about 10 ms in a healthy cluster and has no bound otherwise.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "i", label: "payments-2", kind: "server", sub: "starting", x: 60, y: 100 },
      { id: "cl", label: "Client", kind: "phone", sub: "not watching", x: 360, y: 100 },
      { id: "reg", label: "Registry", kind: "database", sub: "keys: 0", x: 210, y: 190 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "cl", to: "reg", label: "watch /pay" },
      { kind: "say", at: 1.2, actor: "cl", text: "watching", tone: "accent" },
      { kind: "fly", at: 1.5, dur: 0.9, from: "i", to: "reg", label: "register" },
      { kind: "say", at: 2.4, actor: "reg", text: "keys: 1", tone: "accent" },
      { kind: "fly", at: 2.6, dur: 0.9, from: "reg", to: "cl", label: "event: added", tone: "good" },
      { kind: "say", at: 3.5, actor: "cl", text: "has payments-2", tone: "good" },
      { kind: "say", at: 3.9, actor: "i", text: "crashed", tone: "bad" },
      { kind: "mark", at: 3.9, actor: "i", tone: "bad" },
      { kind: "wait", at: 4.1, dur: 2, actor: "reg", label: "lease {n} s", doneLabel: "expired", total: 10 },
      { kind: "say", at: 6.2, actor: "reg", text: "keys: 0", tone: "accent" },
      { kind: "fly", at: 6.4, dur: 0.9, from: "reg", to: "cl", label: "event: gone", tone: "warn" },
      { kind: "say", at: 7.3, actor: "cl", text: "dropped it", tone: "good" },
      { kind: "verdict", at: 7.7, text: "The client is told, it never polls", tone: "good" },
    ],
    loop: 10.4,
  },
};
