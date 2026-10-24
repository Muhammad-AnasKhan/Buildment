import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 25.1 beat 1: Ten o'clock. Many fans press buy; one seat can have only one winner.
export const sysdesignM25DropOpens: SceneSpec = {
  kind: "scene",
  title: "At ten o'clock, 400,000 fans want 20,000 seats",
  purpose: "Many fans ask Tazkara for the same seat in the same second. The seat store accepts one hold and refuses the rest, so most requests must be told no, quickly.",
  limits: "Tazkara is a made-up service. The numbers (400,000 fans, 20,000 seats, 80,000 requests a second) are course assumptions, explained in chapter 25.1. Ten fans on one seat is a picture of the idea, not a measurement.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "fans", label: "Fans", kind: "user", sub: "400,000 waiting", x: 70, y: 100 },
      { id: "site", label: "Tazkara", kind: "server", sub: "20,000 seats", x: 350, y: 100 },
      { id: "db", label: "Seats", kind: "database", sub: "seat 7 is free", x: 210, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "fans", to: "site", label: "80,000 req/s", tone: "warn" },
      { kind: "say", at: 1.3, actor: "site", text: "10 want seat 7", tone: "warn" },
      { kind: "fly", at: 1.6, dur: 0.9, from: "site", to: "db", label: "hold seat 7" },
      { kind: "say", at: 2.6, actor: "db", text: "1 wins", tone: "good" },
      { kind: "fly", at: 2.8, dur: 0.8, from: "db", to: "site", label: "1 yes, 9 no", tone: "warn" },
      { kind: "fly", at: 3.8, dur: 0.9, from: "site", to: "fans", label: "9 told: taken", tone: "bad" },
      { kind: "say", at: 4.7, actor: "fans", text: "most must lose", tone: "bad" },
      { kind: "verdict", at: 5.0, text: "Most holds must fail. Make them cheap", tone: "warn" },
    ],
    loop: 8,
  },
};
