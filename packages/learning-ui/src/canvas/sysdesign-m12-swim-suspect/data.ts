import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 12.8 beat 4 (Suspect first, declare dead later).
export const sysdesignM12SwimSuspect: SceneSpec = {
  kind: "scene",
  title: "A suspected node can answer in time and clear its name",
  purpose: "A marks B as suspected and tells C. C passes the news to B. B replies with a higher incarnation number, alive #2, and A and C go back to alive.",
  limits: "One suspicion and one refutation. If B had stayed silent for the whole suspicion time, A and C would mark it as failed and gossip that. The suspicion time is a setting you choose.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "a", label: "Node A", kind: "server", sub: "B: alive", x: 60, y: 100 },
      { id: "b", label: "Node B", kind: "server", sub: "alive #1", x: 360, y: 100 },
      { id: "c", label: "Node C", kind: "server", sub: "B: alive", x: 210, y: 190 },
    ],
    events: [
      { kind: "say", at: 0.3, actor: "a", text: "B: suspect", tone: "warn" },
      { kind: "mark", at: 0.3, actor: "a", tone: "warn" },
      { kind: "fly", at: 1, dur: 0.9, from: "a", to: "c", label: "B suspect #1" },
      { kind: "say", at: 1.9, actor: "c", text: "B: suspect", tone: "warn" },
      { kind: "fly", at: 2.2, dur: 0.9, from: "c", to: "b", label: "B suspect #1" },
      { kind: "say", at: 3.1, actor: "b", text: "alive #2", tone: "good" },
      { kind: "fly", at: 3.4, dur: 0.9, from: "b", to: "a", label: "alive #2", tone: "good" },
      { kind: "fly", at: 3.4, dur: 0.9, from: "b", to: "c", label: "alive #2", tone: "good" },
      { kind: "say", at: 4.4, actor: "a", text: "B: alive", tone: "good" },
      { kind: "say", at: 4.4, actor: "c", text: "B: alive", tone: "good" },
      { kind: "verdict", at: 4.8, text: "Suspected, then cleared in time", tone: "good" },
    ],
    loop: 8,
  },
};
