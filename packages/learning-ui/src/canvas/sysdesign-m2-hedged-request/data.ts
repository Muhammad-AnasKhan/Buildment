import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 2.4 beat 5: a hedged request. The page asks replica A; when A has not
// answered after a short wait, it sends the same request to replica B and
// uses whichever answer comes first.
export const sysdesignM2HedgedRequest: SceneSpec = {
  kind: "scene",
  title: "Ask a second copy when the first is slow",
  purpose: "Replica A is having a slow moment, so after a short wait the page sends the same request to replica B and takes the first answer.",
  limits: "The 20 ms wait is made up for the picture. Hedging only works for requests that are safe to send twice, such as reads, and it adds a little extra load on the replicas.",
  scene: {
    width: 420,
    height: 260,
    actors: [
      { id: "page", kind: "server", label: "Page", sub: "needs a profile", x: 60, y: 210 },
      { id: "a", kind: "database", label: "Replica A", sub: "copy 1", x: 200, y: 90 },
      { id: "b", kind: "database", label: "Replica B", sub: "copy 2", x: 350, y: 90 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "page", to: "a", label: "get" },
      { kind: "say", at: 1.1, actor: "a", text: "stuck", tone: "bad" },
      { kind: "mark", at: 1.1, actor: "a", tone: "bad" },
      { kind: "wait", at: 1.1, dur: 1.2, actor: "page", label: "waiting {n} ms", doneLabel: "no answer yet", total: 20 },
      { kind: "fly", at: 2.4, dur: 0.8, from: "page", to: "b", label: "same get" },
      { kind: "say", at: 3.2, actor: "b", text: "fast", tone: "good" },
      { kind: "fly", at: 3.3, dur: 0.8, from: "b", to: "page", label: "answer", tone: "good" },
      { kind: "say", at: 4.1, actor: "page", text: "used B", tone: "good" },
      { kind: "say", at: 4.1, actor: "a", text: "cancelled" },
      { kind: "verdict", at: 4.3, text: "Second copy beat the slow one", tone: "good" },
    ],
    loop: 7.2,
  },
};
