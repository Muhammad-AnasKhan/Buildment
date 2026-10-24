import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 14.1 beat 1 (Paid, but never reserved).
export const sysdesignM14PaidNotReserved: SceneSpec = {
  kind: "scene",
  title: "Layla is charged, then checkout crashes before it reserves her stock",
  purpose: "Checkout does two writes to two services. The app dies between them, so the card is charged and no stock is held.",
  limits: "Zaytoun Market is a made-up shop. The 18 is a course number. A real checkout has more steps, and a real crash can land between any two of them.",
  scene: {
    width: 420,
    height: 310,
    actors: [
      { id: "layla", label: "Layla", kind: "phone", sub: "taps Pay", x: 60, y: 100 },
      { id: "checkout", label: "Checkout", kind: "server", sub: "starting", x: 360, y: 100 },
      { id: "pay", label: "Payments", kind: "server", sub: "idle", x: 60, y: 230 },
      { id: "stock", label: "Stock", kind: "database", sub: "5 in stock", x: 360, y: 230 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "layla", to: "checkout", label: "pay 18" },
      { kind: "say", at: 1.1, actor: "checkout", text: "charging" },
      { kind: "fly", at: 1.4, dur: 0.9, from: "checkout", to: "pay", label: "charge 18" },
      { kind: "say", at: 2.3, actor: "pay", text: "charged 18", tone: "good" },
      { kind: "fly", at: 2.5, dur: 0.8, from: "pay", to: "checkout", label: "ok" },
      { kind: "say", at: 3.4, actor: "checkout", text: "crashed", tone: "bad" },
      { kind: "mark", at: 3.4, actor: "checkout", tone: "bad" },
      { kind: "say", at: 4, actor: "stock", text: "no reservation", tone: "warn" },
      { kind: "say", at: 4.4, actor: "layla", text: "was charged", tone: "warn" },
      { kind: "verdict", at: 5, text: "Charged, but no stock reserved", tone: "bad" },
    ],
    loop: 8,
  },
};
