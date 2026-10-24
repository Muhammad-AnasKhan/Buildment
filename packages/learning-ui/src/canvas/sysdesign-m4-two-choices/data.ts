import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 4.5: the power of two choices. Pick two servers at random, send the request
// to the one with fewer requests in flight.
export const sysdesignM4TwoChoices: SceneSpec = {
  kind: "scene",
  title: "Pick two at random, send to the less busy",
  purpose: "Instead of checking every server, the balancer picks two at random and compares only those two. The busier one is skipped.",
  limits: "Four servers fit the picture; the method matters most with many servers and many balancers. The rolls shown are one possible run of the random choice.",
  scene: {
    width: 420,
    height: 335,
    actors: [
      { id: "lb", label: "Balancer", kind: "router", sub: "two choices", x: 62, y: 190 },
      { id: "a", label: "A", kind: "server", sub: "5 in flight", x: 358, y: 85 },
      { id: "b", label: "B", kind: "server", sub: "1 in flight", x: 358, y: 155 },
      { id: "c", label: "C", kind: "server", sub: "4 in flight", x: 358, y: 225 },
      { id: "d", label: "D", kind: "server", sub: "2 in flight", x: 358, y: 295 },
    ],
    events: [
      { kind: "say", at: 0.3, actor: "lb", text: "roll: A and D" },
      { kind: "say", at: 1, actor: "lb", text: "A5 D2: D" },
      { kind: "fly", at: 1.3, dur: 0.6, from: "lb", to: "d", label: "page" },
      { kind: "say", at: 1.9, actor: "d", text: "3 in flight" },
      { kind: "fly", at: 2, dur: 0.6, from: "a", to: "lb", label: "done", tone: "good" },
      { kind: "say", at: 2.1, actor: "a", text: "4 in flight" },
      { kind: "say", at: 2.7, actor: "lb", text: "roll: B and C" },
      { kind: "say", at: 3.4, actor: "lb", text: "B1 C4: B" },
      { kind: "fly", at: 3.7, dur: 0.6, from: "lb", to: "b", label: "page" },
      { kind: "say", at: 4.3, actor: "b", text: "2 in flight", tone: "good" },
      { kind: "fly", at: 4.3, dur: 0.6, from: "c", to: "lb", label: "done", tone: "good" },
      { kind: "say", at: 4.4, actor: "c", text: "3 in flight" },
      { kind: "verdict", at: 4.9, text: "Two random picks, the less busy wins", tone: "good" },
    ],
    loop: 7.9,
  },
};
