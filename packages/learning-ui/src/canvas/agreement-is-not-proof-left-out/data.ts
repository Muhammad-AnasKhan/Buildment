import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 13 v2, chapter 5.3, beat 4: Yara asks what was left out. The
// assistant names two things the first answers skipped: a warning about AI
// written proposals and the residence and tax forms. She checks both on the
// Google Summer of Code FAQ (B68, B70, B71). The assistant's reply is invented.
export const agreementIsNotProofLeftOut: SceneSpec = {
  kind: "scene",
  title: "Ask what was left out, then check it",
  purpose:
    "Yara asks one assistant what it left out, what would change its answer and the strongest case against it. It names two things the first answers skipped. She checks both on the program's FAQ page.",
  limits:
    "The assistant's reply is invented for this example. The three questions are this course's own method, not a tested prompt. Anything new that an assistant names goes back to the primary page, because it can be wrong or out of date too.",
  scene: {
    width: 420,
    height: 310,
    actors: [
      { id: "yara", label: "Yara", kind: "user", sub: "has 2 answers", x: 60, y: 100 },
      { id: "ai", label: "Assistant", kind: "server", sub: "asked neutrally", x: 360, y: 100 },
      { id: "page", label: "FAQ page", kind: "note", sub: "checked today", x: 210, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1.1, from: "yara", to: "ai", label: "what is left out?" },
      { kind: "fly", at: 1.7, dur: 1.1, from: "ai", to: "yara", label: "AI rule, forms", tone: "warn" },
      { kind: "say", at: 2.8, actor: "ai", text: "2 new points", tone: "warn" },
      { kind: "fly", at: 3.3, dur: 1.0, from: "yara", to: "page", label: "check both" },
      { kind: "say", at: 4.3, actor: "page", text: "both are there", tone: "good" },
      { kind: "fly", at: 4.4, dur: 1.0, from: "page", to: "yara", label: "AI warning" },
      { kind: "verdict", at: 5.6, text: "Left out, found, then checked", tone: "good" },
    ],
    loop: 8.5,
  },
};
