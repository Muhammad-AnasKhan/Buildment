import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 25.2 beat 6: Dina pays after her hold expired and Omar holds the seat. The confirm step must refuse.
export const sysdesignM25LatePayment: SceneSpec = {
  kind: "scene",
  title: "Dina pays after her hold ran out",
  purpose: "Dina's 10-minute hold on seat 7 expires. Omar holds the seat. At 10:11 Dina's payment is authorized, but the confirm step checks the hold, finds it gone, and is refused. The authorization is voided.",
  limits: "Times and the 10-minute hold are course numbers. The hold expires by the database clock, not by Dina's phone. Authorize, capture and void are explained in chapter 25.4.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "dina", label: "Dina", kind: "user", sub: "wants seat 7", x: 70, y: 100 },
      { id: "seats", label: "Seats", kind: "database", sub: "seat 7 free", x: 350, y: 100 },
      { id: "omar", label: "Omar", kind: "user", sub: "watching", x: 70, y: 235 },
      { id: "pay", label: "Payments", kind: "server", sub: "idle", x: 350, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "dina", to: "seats", label: "hold seat 7" },
      { kind: "say", at: 1.0, actor: "seats", text: "Dina till 10:10", tone: "accent" },
      { kind: "say", at: 1.5, actor: "dina", text: "still typing", tone: "warn" },
      { kind: "say", at: 2.3, actor: "seats", text: "expired 10:10", tone: "warn" },
      { kind: "fly", at: 2.7, dur: 0.8, from: "omar", to: "seats", label: "hold seat 7" },
      { kind: "say", at: 3.5, actor: "seats", text: "Omar till 10:20", tone: "accent" },
      { kind: "say", at: 3.6, actor: "omar", text: "has a hold", tone: "good" },
      { kind: "fly", at: 4.2, dur: 0.8, from: "dina", to: "pay", label: "pay at 10:11" },
      { kind: "say", at: 5.0, actor: "pay", text: "authorized", tone: "accent" },
      { kind: "fly", at: 5.3, dur: 0.8, from: "pay", to: "seats", label: "confirm: Dina" },
      { kind: "fly", at: 6.1, dur: 0.7, from: "seats", to: "pay", label: "refused", tone: "bad" },
      { kind: "say", at: 6.9, actor: "pay", text: "void: no charge", tone: "good" },
      { kind: "say", at: 7.1, actor: "dina", text: "told: seat gone", tone: "bad" },
      { kind: "verdict", at: 7.4, text: "Check the hold again before selling", tone: "good" },
    ],
    loop: 10.5,
  },
};
