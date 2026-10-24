import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 26.2 beat 5 (One worker owns each host).
export const sysdesignM26HostShards: SceneSpec = {
  kind: "scene",
  title: "A hash of the host picks the worker",
  purpose: "New links are sent to the worker that owns their host, chosen by a hash of the host name. Every page of one site lands on the same worker, so that worker alone enforces the wait between requests to it.",
  limits: "Three workers and three hosts. Real fleets use consistent hashing so adding a worker moves only a share of the hosts (chapter 9.3), and a very large site can still make one worker busier than the others.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "parser", label: "Parser", kind: "worker", sub: "hash of host", x: 210, y: 100 },
      { id: "w1", label: "Worker 1", kind: "worker", sub: "owns news", x: 70, y: 235 },
      { id: "w2", label: "Worker 2", kind: "worker", sub: "owns shop", x: 210, y: 235 },
      { id: "w3", label: "Worker 3", kind: "worker", sub: "owns wiki", x: 350, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.9, from: "parser", to: "w2", label: "shop/p9" },
      { kind: "say", at: 1.1, actor: "w2", text: "queue: 1", tone: "accent" },
      { kind: "fly", at: 1.4, dur: 0.9, from: "parser", to: "w1", label: "news/p4" },
      { kind: "say", at: 2.3, actor: "w1", text: "queue: 1", tone: "accent" },
      { kind: "fly", at: 2.6, dur: 0.9, from: "parser", to: "w2", label: "shop/p2" },
      { kind: "say", at: 3.5, actor: "w2", text: "queue: 2", tone: "accent" },
      { kind: "mark", at: 3.6, actor: "w2", tone: "good" },
      { kind: "say", at: 4.2, actor: "w2", text: "1 request/s", tone: "good" },
      { kind: "verdict", at: 4.4, text: "One owner per host: easy politeness", tone: "good" },
    ],
    loop: 8,
  },
};
