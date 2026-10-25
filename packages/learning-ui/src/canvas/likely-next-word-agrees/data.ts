import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 13 v2, chapter 6.2 beat 5: an assistant may agree with the way a
// question leans (dossier B7 to B9). One question that invites yes, one that
// asks for the case against. An illustration of a tendency, not a recording.
export const likelyNextWordAgrees: SceneSpec = {
  kind: "scene",
  title: "A leaning question invites a yes",
  purpose: "Ask an assistant whether Redis is best and it may simply agree. Ask when Redis would be wrong and you get reasons to check.",
  limits: "An illustration of a tendency called sycophancy, not a recording. Assistants differ, answers vary from one ask to the next, and a neutral question helps but does not make an answer true.",
  scene: {
    width: 420,
    height: 260,
    actors: [
      { id: "you", label: "You", kind: "user", sub: "asks twice", x: 70, y: 120 },
      { id: "ai", label: "Assistant", kind: "server", sub: "may agree", x: 340, y: 120 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 1, from: "you", to: "ai", label: "best, right?" },
      { kind: "say", at: 1.1, actor: "ai", text: "yes, great", tone: "warn" },
      { kind: "fly", at: 1.3, dur: 1, from: "ai", to: "you", label: "yes", tone: "warn" },
      { kind: "say", at: 2.4, actor: "you", text: "no new facts", tone: "warn" },
      { kind: "fly", at: 3.6, dur: 1, from: "you", to: "ai", label: "when wrong?" },
      { kind: "say", at: 4.7, actor: "ai", text: "gives reasons", tone: "good" },
      { kind: "fly", at: 4.9, dur: 1, from: "ai", to: "you", label: "3 cases", tone: "good" },
      { kind: "say", at: 6.0, actor: "you", text: "facts to check", tone: "good" },
      { kind: "verdict", at: 6.4, text: "Ask for the case against, too", tone: "accent" },
    ],
    loop: 9.5,
  },
};
