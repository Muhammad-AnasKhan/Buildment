import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 12.4 beat 2 (The old leader still writes).
export const sysdesignM12StaleWrite: SceneSpec = {
  kind: "scene",
  title: "The old leader wakes up and overwrites the new leader's data",
  purpose: "A froze while holding token 33. Its lease ran out and B became leader with token 34 and wrote x = B. When A wakes it writes x = A, and storage accepts it.",
  limits: "Storage here accepts any write and checks nothing. The next beat turns on the check. The 14 second freeze matches the lease story in the beat: longer than the 10 second lease.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "a", label: "Client A", kind: "server", sub: "leader, #33", x: 60, y: 100 },
      { id: "b", label: "Client B", kind: "server", sub: "no lock", x: 360, y: 100 },
      { id: "st", label: "Storage", kind: "database", sub: "x = 0", x: 210, y: 190 },
    ],
    events: [
      { kind: "say", at: 0.3, actor: "a", text: "frozen 14 s", tone: "warn" },
      { kind: "mark", at: 0.3, actor: "a", tone: "warn" },
      { kind: "say", at: 1.2, actor: "b", text: "leader, #34", tone: "good" },
      { kind: "fly", at: 1.6, dur: 0.9, from: "b", to: "st", label: "x=B, #34" },
      { kind: "say", at: 2.6, actor: "st", text: "x = B", tone: "good" },
      { kind: "say", at: 3.6, actor: "a", text: "awake, #33", tone: "warn" },
      { kind: "fly", at: 4, dur: 0.9, from: "a", to: "st", label: "x=A, #33" },
      { kind: "say", at: 5, actor: "st", text: "x = A", tone: "bad" },
      { kind: "mark", at: 5, actor: "st", tone: "bad" },
      { kind: "verdict", at: 5.4, text: "Old leader overwrote the new one", tone: "bad" },
    ],
    loop: 8.6,
  },
};
