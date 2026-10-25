import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 13 v2, chapter 6.1 beat 1: Tala and Munir (both fictional) ask one
// assistant the same question and get the same answer. A story beat for a
// set-the-scene chapter: it plays, the learner changes nothing.
export const twoTeamsSameAnswer: SceneSpec = {
  kind: "scene",
  title: "Two teams, one question, one answer",
  purpose: "Tala and Munir each ask an assistant which cache to use. Both hear Redis. For Tala it is fine; for Munir it needs a licence check first.",
  limits: "A made-up story with two fictional people. The assistant's words are an illustration, not a recording of a real tool. The licence facts are in the chapter's sources.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "tala", label: "Tala", kind: "user", sub: "internal tool", x: 70, y: 70 },
      { id: "munir", label: "Munir", kind: "user", sub: "sells caching", x: 70, y: 230 },
      { id: "ai", label: "Assistant", kind: "server", sub: "one sentence", x: 340, y: 150 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 0.9, from: "tala", to: "ai", label: "which cache?" },
      { kind: "fly", at: 0.4, dur: 0.9, from: "munir", to: "ai", label: "which cache?" },
      { kind: "say", at: 1.4, actor: "ai", text: "Redis" },
      { kind: "fly", at: 1.6, dur: 0.9, from: "ai", to: "tala", label: "Redis" },
      { kind: "fly", at: 1.8, dur: 0.9, from: "ai", to: "munir", label: "Redis" },
      { kind: "say", at: 2.8, actor: "tala", text: "fits her use", tone: "good" },
      { kind: "say", at: 3.0, actor: "munir", text: "check licence", tone: "warn" },
      { kind: "mark", at: 3.0, actor: "munir", tone: "warn" },
      { kind: "verdict", at: 3.6, text: "Same answer, different right answer", tone: "accent" },
    ],
    loop: 7,
  },
};
