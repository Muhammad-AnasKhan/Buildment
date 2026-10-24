import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 12.8 beat 1 (A rumor doubles each round).
export const sysdesignM12GossipRumor: SceneSpec = {
  kind: "scene",
  title: "A rumor can reach seven nodes in three rounds",
  purpose: "Each round, every node that knows the rumor tells one other node. In the best case no one tells a node that already knows, and the number that know doubles: 1, 2, 4, 7.",
  limits: "This is the best case, chosen so the picture is clear. With random picks some nodes tell a node that already knows, so 7 nodes need about 5 rounds on average with fanout 1 (course simulation). The growth is still about log N.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "n1", label: "N1", kind: "server", sub: "knows", x: 60, y: 100 },
      { id: "n2", label: "N2", kind: "server", sub: "does not know", x: 210, y: 100 },
      { id: "n3", label: "N3", kind: "server", sub: "does not know", x: 360, y: 100 },
      { id: "n4", label: "N4", kind: "server", sub: "does not know", x: 135, y: 175 },
      { id: "n5", label: "N5", kind: "server", sub: "does not know", x: 285, y: 175 },
      { id: "n6", label: "N6", kind: "server", sub: "does not know", x: 135, y: 250 },
      { id: "n7", label: "N7", kind: "server", sub: "does not know", x: 285, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.6, dur: 0.9, from: "n1", to: "n4", label: "rumor" },
      { kind: "say", at: 1.6, actor: "n4", text: "knows", tone: "good" },
      { kind: "fly", at: 2.2, dur: 0.9, from: "n1", to: "n2", label: "rumor" },
      { kind: "fly", at: 2.2, dur: 0.9, from: "n4", to: "n6", label: "rumor" },
      { kind: "say", at: 3.2, actor: "n2", text: "knows", tone: "good" },
      { kind: "say", at: 3.2, actor: "n6", text: "knows", tone: "good" },
      { kind: "fly", at: 3.8, dur: 0.9, from: "n1", to: "n3", label: "rumor" },
      { kind: "fly", at: 3.8, dur: 0.9, from: "n2", to: "n5", label: "rumor" },
      { kind: "fly", at: 3.8, dur: 0.9, from: "n6", to: "n7", label: "rumor" },
      { kind: "say", at: 4.8, actor: "n3", text: "knows", tone: "good" },
      { kind: "say", at: 4.8, actor: "n5", text: "knows", tone: "good" },
      { kind: "say", at: 4.8, actor: "n7", text: "knows", tone: "good" },
      { kind: "verdict", at: 5.2, text: "7 nodes know after 3 rounds", tone: "good" },
    ],
    loop: 8.4,
  },
};
