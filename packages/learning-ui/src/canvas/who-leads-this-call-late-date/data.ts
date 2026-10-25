import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 13 v2, chapter 11.2 beat 4: a call that only a person can make,
// because the client needs a person to say it and to answer questions.
export const whoLeadsThisCallLateDate: SceneSpec = {
  kind: "scene",
  title: "Telling the client the project is late",
  purpose: "Manar uses an AI draft as notes, then phones the client herself, hears two questions and answers them.",
  limits: "A fictional freelancer and client. Some clients prefer a written message, and then a person still sends it and answers the reply. The picture shows who is on the call, not that a call is always needed.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "manar", label: "Manar", kind: "user", sub: "freelancer", x: 60, y: 110 },
      { id: "ai", label: "AI assistant", kind: "server", sub: "drafts notes", x: 360, y: 110 },
      { id: "client", label: "Client", kind: "phone", sub: "café owner", x: 360, y: 228 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 1, from: "manar", to: "ai", label: "ask draft" },
      { kind: "fly", at: 1.2, dur: 1, from: "ai", to: "manar", label: "a draft" },
      { kind: "say", at: 2.2, actor: "manar", text: "uses as notes", tone: "accent" },
      { kind: "fly", at: 3, dur: 1.4, from: "manar", to: "client", label: "she calls" },
      { kind: "say", at: 4.4, actor: "client", text: "asks why", tone: "good" },
      { kind: "fly", at: 5, dur: 1.4, from: "client", to: "manar", label: "2 questions" },
      { kind: "say", at: 6.4, actor: "manar", text: "answers them", tone: "good" },
      { kind: "say", at: 7, actor: "ai", text: "not on the call", tone: "warn" },
      { kind: "verdict", at: 7.6, text: "A person says it, a person answers", tone: "good" },
    ],
    loop: 10.5,
  },
};
