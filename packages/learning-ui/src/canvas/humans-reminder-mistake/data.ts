import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 13 v2, chapter 11.1 beat 1: Jawad (fictional) at a fictional booking
// service for small clinics. An AI-assisted reminder function passed his one
// test on his laptop, then showed 230 patients a time three hours early.
export const humansReminderMistake: SceneSpec = {
  kind: "scene",
  title: "A reminder that looked right in the test",
  purpose: "Jawad asks an AI assistant for reminder code, tests one visit, sends 230 texts with the time three hours early, and the clinic calls him.",
  hint: "Watch: it plays on its own. Press Replay to see it again.",
  limits: "A fictional service, developer and clinic, with made-up numbers. Real mistakes come from many causes, and the person who shipped the code is not always one developer.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "jawad", label: "Jawad", kind: "user", sub: "developer", x: 60, y: 110 },
      { id: "ai", label: "AI assistant", kind: "server", sub: "wrote the code", x: 360, y: 110 },
      { id: "service", label: "Reminders", kind: "server", sub: "sends texts", x: 60, y: 228 },
      { id: "patients", label: "Patients", kind: "phone", sub: "230 messages", x: 360, y: 228 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 1, from: "jawad", to: "ai", label: "ask for code" },
      { kind: "fly", at: 1.2, dur: 1, from: "ai", to: "jawad", label: "the code" },
      { kind: "say", at: 2.2, actor: "jawad", text: "test looks ok", tone: "good" },
      { kind: "fly", at: 3, dur: 1, from: "jawad", to: "service", label: "deploy" },
      { kind: "say", at: 4, actor: "service", text: "clock behind", tone: "bad" },
      { kind: "fly", at: 4.2, dur: 1, from: "service", to: "patients", label: "230 texts" },
      { kind: "say", at: 5.2, actor: "patients", text: "10:00 not 13:00", tone: "bad" },
      { kind: "fly", at: 6, dur: 1.2, from: "patients", to: "jawad", label: "clinic calls" },
      { kind: "say", at: 7.2, actor: "jawad", text: "answers calls", tone: "warn" },
      { kind: "mark", at: 7.2, actor: "jawad", tone: "warn" },
      { kind: "say", at: 7.8, actor: "ai", text: "not on the call", tone: "warn" },
      { kind: "verdict", at: 8.4, text: "Jawad answers, not the assistant", tone: "warn" },
    ],
    loop: 11.5,
  },
};
