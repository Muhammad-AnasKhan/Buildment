import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 13 v2, chapter 5.3, beat 1: Yara asks assistant A and assistant B the
// same question in two fresh chats. They differ on who may join Google Summer
// of Code (B70), so she knows where to look first. They agree on the old
// Hacktoberfest reward rule (B69) and both are out of date, which is why
// agreement is not proof (B15). The answers are invented for this example.
export const agreementIsNotProofTwo: SceneSpec = {
  kind: "scene",
  title: "Two assistants differ, then agree",
  purpose:
    "Yara asks assistants A and B the same question in two fresh chats. They disagree on who may join Google Summer of Code, so she knows where to look first. Then both repeat the same out of date reward rule, so agreement does not prove it.",
  limits:
    "The answers are invented for this example. Real assistants often agree on some points and differ on others. In one study, two models that were both wrong gave the same wrong answer 60% of the time on one leaderboard, so agreement raises confidence less than it feels.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "yara", label: "Yara", kind: "user", sub: "same question", x: 60, y: 175 },
      { id: "a", label: "Assistant A", kind: "server", sub: "fresh chat", x: 360, y: 100 },
      { id: "b", label: "Assistant B", kind: "server", sub: "fresh chat", x: 360, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1.0, from: "yara", to: "a", label: "who can join?" },
      { kind: "fly", at: 0.3, dur: 1.0, from: "yara", to: "b", label: "who can join?" },
      { kind: "fly", at: 1.6, dur: 1.0, from: "a", to: "yara", label: "students only", tone: "warn" },
      { kind: "fly", at: 1.6, dur: 1.0, from: "b", to: "yara", label: "or beginners", tone: "warn" },
      { kind: "say", at: 2.7, actor: "yara", text: "they differ", tone: "warn" },
      { kind: "verdict", at: 2.8, text: "They differ: look here first", tone: "warn" },
      { kind: "fly", at: 4.4, dur: 1.0, from: "a", to: "yara", label: "4 pull requests" },
      { kind: "fly", at: 4.4, dur: 1.0, from: "b", to: "yara", label: "4 pull requests" },
      { kind: "say", at: 5.5, actor: "yara", text: "they agree", tone: "good" },
      { kind: "mark", at: 5.6, actor: "yara", tone: "bad" },
      { kind: "verdict", at: 5.7, text: "They agree, and both are old", tone: "bad" },
    ],
    loop: 8.8,
  },
};
