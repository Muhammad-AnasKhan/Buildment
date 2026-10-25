import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 13 v2, chapter 11.4 beat 3: a task where a mistake costs a lot and
// the person cannot check the result, so a reviewer comes in.
export const useAiOrNotLoginCode: SceneSpec = {
  kind: "scene",
  title: "Login code that runs but cannot be checked",
  purpose: "Ehab gets login code from an AI assistant, cannot tell whether it is safe, and asks a mentor to review it before 60 members use it.",
  limits: "A fictional fellow and study group, with a made-up review result. A review lowers the risk but does not remove it, and a ready-made sign-in service may be a better choice than any custom code. The picture shows one way to make an unchecked result checkable.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "ehab", label: "Ehab", kind: "user", sub: "fellow", x: 60, y: 110 },
      { id: "ai", label: "AI assistant", kind: "server", sub: "writes login", x: 360, y: 110 },
      { id: "code", label: "Login code", kind: "note", sub: "40 lines", x: 360, y: 228 },
      { id: "mentor", label: "Mentor", kind: "user", sub: "can review", x: 60, y: 228 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 1, from: "ehab", to: "ai", label: "ask login" },
      { kind: "fly", at: 1.2, dur: 1, from: "ai", to: "code", label: "40 lines" },
      { kind: "say", at: 2.4, actor: "code", text: "runs fine", tone: "good" },
      { kind: "say", at: 3, actor: "ehab", text: "cannot review", tone: "warn" },
      { kind: "say", at: 3.8, actor: "code", text: "may be unsafe", tone: "bad" },
      { kind: "fly", at: 4.6, dur: 1.2, from: "ehab", to: "mentor", label: "review it" },
      { kind: "say", at: 5.8, actor: "mentor", text: "finds 2 flaws", tone: "good" },
      { kind: "verdict", at: 6.4, text: "High stakes, no check: get a reviewer", tone: "good" },
    ],
    loop: 9.5,
  },
};
