import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 10.3 beat 5: three servers receive the same three events in different
// orders, sort by (counter, node id), and get the same list.
export const sysdesignM10LamportSort: SceneSpec = {
  kind: "scene",
  title: "Sort by number, then node, and everyone agrees",
  purpose: "Events A4, C4 and B6 reach three servers in different orders. Each sorts by counter and breaks the tie A4 against C4 by node name, so all three get the same list.",
  limits: "This gives every server the same order, not the true order. A4 and C4 are concurrent: the tie-break is a rule everyone follows, not a fact about what happened first.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "net", label: "Network", kind: "router", sub: "tie: node name", x: 210, y: 95 },
      { id: "s1", label: "Server 1", kind: "server", sub: "waiting", x: 60, y: 190 },
      { id: "s2", label: "Server 2", kind: "server", sub: "waiting", x: 210, y: 190 },
      { id: "s3", label: "Server 3", kind: "server", sub: "waiting", x: 360, y: 190 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 1, from: "net", to: "s1", label: "A4 C4 B6" },
      { kind: "fly", at: 0.4, dur: 1, from: "net", to: "s2", label: "A4 C4 B6" },
      { kind: "fly", at: 0.4, dur: 1, from: "net", to: "s3", label: "A4 C4 B6" },
      { kind: "say", at: 1.4, actor: "s1", text: "got C4 A4 B6", tone: "warn" },
      { kind: "say", at: 1.4, actor: "s2", text: "got B6 A4 C4", tone: "warn" },
      { kind: "say", at: 1.4, actor: "s3", text: "got A4 B6 C4", tone: "warn" },
      { kind: "say", at: 3, actor: "s1", text: "A4 C4 B6", tone: "good" },
      { kind: "say", at: 3, actor: "s2", text: "A4 C4 B6", tone: "good" },
      { kind: "say", at: 3, actor: "s3", text: "A4 C4 B6", tone: "good" },
      { kind: "verdict", at: 3.4, text: "Every server sorts the same way", tone: "good" },
    ],
    loop: 7,
  },
};
