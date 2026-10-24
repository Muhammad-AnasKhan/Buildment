import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 12.6 beat 1 (Copy it, count it, commit it).
export const sysdesignM12LogCommit: SceneSpec = {
  kind: "scene",
  title: "A leader commits an entry once a majority has copied it",
  purpose: "A client sends x = 5. The leader adds it to its log and sends it to S2 and S3. S2 answers first, so 2 of 3 hold it and the leader commits and replies. S3 gets the entry later.",
  limits: "Three servers and one entry. The leader commits when a majority of the whole cluster holds the entry in its own term; it does not wait for the slowest server.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "c", label: "Client", kind: "phone", sub: "sends x=5", x: 60, y: 100 },
      { id: "s1", label: "S1 leader", kind: "server", sub: "log: empty", x: 210, y: 100 },
      { id: "s2", label: "S2", kind: "server", sub: "log: empty", x: 135, y: 190 },
      { id: "s3", label: "S3", kind: "server", sub: "log: empty", x: 285, y: 190 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "c", to: "s1", label: "set x=5" },
      { kind: "say", at: 1.3, actor: "s1", text: "log: x=5", tone: "accent" },
      { kind: "fly", at: 1.5, dur: 0.9, from: "s1", to: "s2", label: "append x=5" },
      { kind: "fly", at: 1.5, dur: 2.1, from: "s1", to: "s3", label: "append x=5" },
      { kind: "say", at: 2.5, actor: "s2", text: "log: x=5", tone: "good" },
      { kind: "fly", at: 2.6, dur: 0.9, from: "s2", to: "s1", label: "ok", tone: "good" },
      { kind: "say", at: 3.6, actor: "s1", text: "committed", tone: "good" },
      { kind: "mark", at: 3.6, actor: "s1", tone: "good" },
      { kind: "fly", at: 3.8, dur: 0.9, from: "s1", to: "c", label: "done", tone: "good" },
      { kind: "say", at: 3.7, actor: "s3", text: "log: x=5", tone: "good" },
      { kind: "say", at: 4.8, actor: "c", text: "x=5 saved", tone: "good" },
      { kind: "verdict", at: 5.2, text: "A majority has it: committed", tone: "good" },
    ],
    loop: 8.4,
  },
};
