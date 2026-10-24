import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 13.2 beat 3: The client is told OK after 2 of 3 copies are saved.
export const sysdesignM13WritePath: SceneSpec = {
  kind: "scene",
  title: "The client is told OK after 2 of 3 copies are saved",
  purpose: "Node A coordinates the write and keeps the first copy. Node B confirms quickly. Node C is slow. With W = 2 the client is told OK before C has the value.",
  limits: "N = 3 and W = 2, the common Dynamo setting (S45). Message times are made up. The coordinator is also a replica here, which is typical but not required.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "client", label: "Client", kind: "phone", sub: "W = 2", x: 60, y: 100 },
      { id: "a", label: "Node A", kind: "database", sub: "coordinator", x: 210, y: 100 },
      { id: "b", label: "Node B", kind: "database", sub: "x = 6", x: 60, y: 205 },
      { id: "c", label: "Node C", kind: "database", sub: "x = 6", x: 360, y: 205 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 1, from: "client", to: "a", label: "write x = 7" },
      { kind: "say", at: 1.3, actor: "a", text: "saved: 1 of 2", tone: "accent" },
      { kind: "fly", at: 1.5, dur: 1, from: "a", to: "b", label: "copy x = 7" },
      { kind: "fly", at: 1.5, dur: 2.7, from: "a", to: "c", label: "copy x = 7" },
      { kind: "say", at: 2.4, actor: "b", text: "x = 7", tone: "good" },
      { kind: "fly", at: 2.4, dur: 0.9, from: "b", to: "a", label: "ack", tone: "good" },
      { kind: "say", at: 3.3, actor: "a", text: "2 of 3: done", tone: "good" },
      { kind: "fly", at: 3.4, dur: 1, from: "a", to: "client", label: "OK", tone: "good" },
      { kind: "say", at: 4.4, actor: "client", text: "x = 7 saved", tone: "good" },
      { kind: "say", at: 4.1, actor: "c", text: "x = 7", tone: "good" },
      { kind: "verdict", at: 4.5, text: "Told OK after 2 of 3 copies", tone: "good" },
    ],
    loop: 7.5,
  },
};
