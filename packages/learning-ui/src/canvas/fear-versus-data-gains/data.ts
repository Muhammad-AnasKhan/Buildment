import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 13 v2, chapter 1.3, beat 4: gains depend on the task. A 2023 study of
// 758 consultants (A35): inside the tool's strengths AI users did more, faster
// and better; on one task outside, they were less often right. Watch-only; the
// playable canvas of this chapter is fear-versus-data.
export const fearVersusDataGains: SceneSpec = {
  kind: "scene",
  title: "Gains depend on the task",
  purpose: "Consultants with AI help do more, faster, on a task that suits the tool, and are less often right on one task that does not.",
  limits: "One study of 758 consultants at one firm in 2023, with GPT-4 and tasks the researchers designed. Only one task sat outside what the tool did well. It shows that fit matters, not how large the effect is today.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "worker", label: "Consultant", kind: "user", sub: "has AI help", x: 70, y: 100 },
      { id: "ai", label: "AI help", kind: "server", sub: "ready", x: 300, y: 100 },
      { id: "result", label: "Result", kind: "note", sub: "waiting", x: 300, y: 222 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 0.8, from: "worker", to: "ai", label: "task it suits" },
      { kind: "fly", at: 0.9, dur: 0.8, from: "ai", to: "result", label: "draft" },
      { kind: "say", at: 1.7, actor: "result", text: "more, faster", tone: "good" },

      { kind: "fly", at: 3.2, dur: 0.8, from: "worker", to: "ai", label: "task it misses" },
      { kind: "fly", at: 4.1, dur: 0.8, from: "ai", to: "result", label: "draft" },
      { kind: "say", at: 4.9, actor: "result", text: "less accurate", tone: "bad" },
      { kind: "verdict", at: 5.4, text: "It depends on the task", tone: "accent" },
    ],
    loop: 9,
  },
};
