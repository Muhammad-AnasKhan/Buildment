import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 12.7 beat 3 (Two proposers keep outbidding).
export const sysdesignM12PaxosDuel: SceneSpec = {
  kind: "scene",
  title: "Two proposers can keep outbidding each other",
  purpose: "P1 prepares with number 1, P2 prepares with number 2 before P1 can accept, and P1's accept is rejected. P1 retries with 3, and then P2's accept is rejected. Neither value is chosen.",
  limits: "One group of acceptors drawn as a single box, and an unlucky timing arranged for the picture. In practice proposers wait a random time and one of them wins, or the group elects one distinguished proposer.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "p1", label: "Proposer 1", kind: "server", sub: "wants A", x: 60, y: 100 },
      { id: "p2", label: "Proposer 2", kind: "server", sub: "wants B", x: 360, y: 100 },
      { id: "acc", label: "Acceptors", kind: "database", sub: "promised: 0", x: 210, y: 190 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "p1", to: "acc", label: "prepare 1" },
      { kind: "say", at: 1.2, actor: "acc", text: "promised: 1", tone: "accent" },
      { kind: "fly", at: 1.3, dur: 0.9, from: "acc", to: "p1", label: "promise 1", tone: "good" },
      { kind: "fly", at: 2.4, dur: 0.9, from: "p2", to: "acc", label: "prepare 2" },
      { kind: "say", at: 3.3, actor: "acc", text: "promised: 2", tone: "accent" },
      { kind: "fly", at: 3.4, dur: 0.9, from: "acc", to: "p2", label: "promise 2", tone: "good" },
      { kind: "fly", at: 4, dur: 0.9, from: "p1", to: "acc", label: "accept 1, A" },
      { kind: "say", at: 4.9, actor: "acc", text: "no: promised 2", tone: "bad" },
      { kind: "say", at: 4.9, actor: "p1", text: "rejected", tone: "bad" },
      { kind: "fly", at: 5.3, dur: 0.9, from: "p1", to: "acc", label: "prepare 3" },
      { kind: "say", at: 6.2, actor: "acc", text: "promised: 3", tone: "accent" },
      { kind: "fly", at: 6.3, dur: 0.9, from: "p2", to: "acc", label: "accept 2, B" },
      { kind: "say", at: 7.2, actor: "acc", text: "no: promised 3", tone: "bad" },
      { kind: "say", at: 7.2, actor: "p2", text: "rejected", tone: "bad" },
      { kind: "verdict", at: 7.6, text: "Two proposers keep outbidding", tone: "bad" },
    ],
    loop: 10.4,
  },
};
