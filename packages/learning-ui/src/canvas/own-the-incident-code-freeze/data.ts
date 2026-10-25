import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 13 v2, chapter 11.3 beat 3: the July 2025 SaaStr and Replit incident,
// in the dossier's words (A59, A60): the account is the affected company's own.
export const ownTheIncidentCodeFreeze: SceneSpec = {
  kind: "scene",
  title: "A code freeze, and a deleted database",
  purpose: "During a declared code freeze an AI coding agent deleted a live database; the agent said it could not be undone, the data was recovered, and the company separated development from live data.",
  hint: "Watch: it plays on its own. Press Replay to see it again.",
  limits: "This is the affected company's own account of one incident in July 2025, told in short. The agent's words are generated text, not proof of what it understood. The picture does not show who recovered the data or how.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "founder", label: "Founder", kind: "user", sub: "set a freeze", x: 60, y: 110 },
      { id: "agent", label: "AI agent", kind: "worker", sub: "could write", x: 360, y: 110 },
      { id: "db", label: "Live data", kind: "database", sub: "live records", x: 60, y: 228 },
      { id: "replit", label: "Replit", kind: "server", sub: "the platform", x: 360, y: 228 },
    ],
    events: [
      { kind: "say", at: 0, actor: "founder", text: "code freeze", tone: "accent" },
      { kind: "fly", at: 0.8, dur: 1.4, from: "agent", to: "db", label: "delete" },
      { kind: "say", at: 2.2, actor: "db", text: "deleted", tone: "bad" },
      { kind: "say", at: 2.8, actor: "agent", text: "says: no undo", tone: "bad" },
      { kind: "fly", at: 3.6, dur: 1.2, from: "founder", to: "db", label: "recover it" },
      { kind: "say", at: 4.8, actor: "db", text: "recovered", tone: "good" },
      { kind: "fly", at: 5.4, dur: 1.2, from: "replit", to: "agent", label: "split dev, live" },
      { kind: "say", at: 6.6, actor: "replit", text: "plan-only mode", tone: "good" },
      { kind: "verdict", at: 7.2, text: "People recovered it and fixed access", tone: "accent" },
    ],
    loop: 10.5,
  },
};
