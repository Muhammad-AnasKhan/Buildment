import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 2.4 beat (watch only): millions of separate homes reuse the same private
// address, and none can see the others. Three homes each have a laptop at
// 192.168.1.23 behind their own router. Each router sends traffic out under its
// own public address (the 203.0.113.0/24 documentation block stands in for real
// ones). When a laptop sends to 192.168.1.23 beyond its own home, the Internet
// drops it: private addresses stay inside each home. The homes, routers and
// public addresses are made up.
export const netM2SceneSameAddress: SceneSpec = {
  kind: "scene",
  title: "Three homes, one private address",
  purpose:
    "Three homes each have a laptop at 192.168.1.23 behind their own router. Each router sends traffic out under its own public address. A packet sent to 192.168.1.23 beyond the home is dropped, so no home sees another.",
  limits:
    "Three made-up homes, with 203.0.113.0/24 documentation addresses standing in for public ones. The picture leaves out how a router rewrites addresses on the way out and back: that is NAT, in module 6. In this picture the Internet drops the packet; a real router near the home may do it first.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "l1", label: "Laptop 1", kind: "worker", sub: "192.168.1.23", x: 70, y: 84 },
      { id: "l2", label: "Laptop 2", kind: "worker", sub: "192.168.1.23", x: 210, y: 84 },
      { id: "l3", label: "Laptop 3", kind: "worker", sub: "192.168.1.23", x: 350, y: 84 },
      { id: "r1", label: "Router 1", kind: "router", sub: "203.0.113.5", x: 70, y: 176 },
      { id: "r2", label: "Router 2", kind: "router", sub: "203.0.113.9", x: 210, y: 176 },
      { id: "r3", label: "Router 3", kind: "router", sub: "203.0.113.14", x: 350, y: 176 },
      { id: "net", label: "Internet", kind: "cdn", sub: "public only", x: 210, y: 268 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 1, from: "l1", to: "r1", label: "to the web" },
      { kind: "fly", at: 0.4, dur: 1, from: "l2", to: "r2", label: "to the web" },
      { kind: "fly", at: 0.4, dur: 1, from: "l3", to: "r3", label: "to the web" },
      { kind: "fly", at: 1.6, dur: 1.1, from: "r1", to: "net", label: "from .5" },
      { kind: "fly", at: 1.6, dur: 1.1, from: "r2", to: "net", label: "from .9" },
      { kind: "fly", at: 1.6, dur: 1.1, from: "r3", to: "net", label: "from .14" },
      { kind: "say", at: 2.9, actor: "net", text: "sees 3 routers", tone: "accent" },
      { kind: "fly", at: 4, dur: 1, from: "l1", to: "r1", label: "to 192.168.1.23" },
      { kind: "fly", at: 5.1, dur: 1.1, from: "r1", to: "net", label: "to 192.168.1.23", tone: "bad" },
      { kind: "say", at: 6.4, actor: "net", text: "drops it", tone: "bad" },
      { kind: "mark", at: 6.4, actor: "net", tone: "bad" },
      { kind: "say", at: 6.8, actor: "l2", text: "sees nothing", tone: "good" },
      { kind: "say", at: 6.8, actor: "l3", text: "sees nothing", tone: "good" },
      { kind: "verdict", at: 7.2, text: "Same address, different homes.", tone: "accent" },
    ],
    loop: 10,
  },
};
