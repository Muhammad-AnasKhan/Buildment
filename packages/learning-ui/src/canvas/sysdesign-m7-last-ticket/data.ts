import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.1 beat 1 (Set the scene). Two buyers who read the same count before either writes it back can both succeed. The second write overwrites the first, so one sale is lost from the count and one ticket is sold twice.
export const sysdesignM7LastTicket: SceneSpec = {
  kind: "scene",
  title: "Two buyers, one ticket, two sales",
  purpose: "Dina and Omar both read '1 ticket left', then each writes 0. Both are told the ticket is theirs.",
  limits: "The story is made up (Ticketline is a fictional app) and the timing is stretched so you can follow it. In a real system both reads happen within a few milliseconds. The fix comes in chapter 7.5.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "dina", label: "Dina", kind: "phone", sub: "wants 1 ticket", x: 60, y: 100 },
      { id: "omar", label: "Omar", kind: "phone", sub: "wants 1 ticket", x: 360, y: 100 },
      { id: "db", label: "Database", kind: "database", sub: "tickets left: 1", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "dina", to: "db", label: "how many left?" },
      { kind: "fly", at: 0.5, dur: 0.7, from: "omar", to: "db", label: "how many left?" },
      { kind: "fly", at: 1.3, dur: 0.7, from: "db", to: "dina", label: "1 left", tone: "good" },
      { kind: "fly", at: 1.4, dur: 0.7, from: "db", to: "omar", label: "1 left", tone: "good" },
      { kind: "say", at: 2.1, actor: "dina", text: "sees 1 left", tone: "good" },
      { kind: "say", at: 2.2, actor: "omar", text: "sees 1 left", tone: "good" },
      { kind: "fly", at: 2.6, dur: 0.7, from: "dina", to: "db", label: "set to 0" },
      { kind: "fly", at: 2.8, dur: 0.7, from: "omar", to: "db", label: "set to 0" },
      { kind: "say", at: 3.5, actor: "db", text: "tickets left: 0" },
      { kind: "fly", at: 3.8, dur: 0.7, from: "db", to: "dina", label: "ticket sold", tone: "good" },
      { kind: "fly", at: 3.9, dur: 0.7, from: "db", to: "omar", label: "ticket sold", tone: "good" },
      { kind: "say", at: 4.6, actor: "db", text: "sold 2 of 1", tone: "bad" },
      { kind: "mark", at: 4.6, actor: "db", tone: "bad" },
      { kind: "verdict", at: 4.9, text: "Two tickets sold, one seat", tone: "bad" },
    ],
    loop: 7.7,
  },
};
