import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 22.3 beat 1: a phone opens a line to one gateway, and the gateway writes that fact in the registry.
export const sysdesignM22RegisterSession: SceneSpec = {
  kind: "scene",
  title: "The registry remembers which gateway holds Sami",
  purpose: "Sami's phone opens a line to Gateway 2. The gateway writes \"Sami is on Gateway 2\" in the registry, with a time limit, so any other server can look it up.",
  limits: "One gateway is drawn out of about 60. The registry is a fast in-memory store with its own copies. The time limit and how it is kept alive are in the presence chapter.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "sami", label: "Sami", kind: "phone", sub: "opens the app", x: 70, y: 100 },
      { id: "gw", label: "Gateway 2", kind: "router", sub: "50,000 lines", x: 350, y: 100 },
      { id: "reg", label: "Registry", kind: "cache", sub: "no entry", x: 350, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "sami", to: "gw", label: "open line" },
      { kind: "say", at: 1.2, actor: "gw", text: "checks login", tone: "accent" },
      { kind: "fly", at: 1.7, dur: 0.9, from: "gw", to: "reg", label: "Sami is here" },
      { kind: "say", at: 2.6, actor: "reg", text: "sami = gw 2", tone: "good" },
      { kind: "fly", at: 2.9, dur: 0.9, from: "gw", to: "sami", label: "line open", tone: "good" },
      { kind: "say", at: 3.8, actor: "sami", text: "online", tone: "good" },
      { kind: "verdict", at: 3.9, text: "Registry knows where Sami is", tone: "good" },
    ],
    loop: 7,
  },
};
