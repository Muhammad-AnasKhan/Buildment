import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 6.1 beat 1: Huda taps Pay, the provider charges her card but replies late,
// the app gives up at 10 s and she taps again: a second, separate charge.
export const sysdesignM6DoubleCharge: SceneSpec = {
  kind: "scene",
  title: "One tap, a timeout, two charges",
  purpose: "The provider charges the card, but its reply is late; the app gives up, Huda taps Pay again, and the second payment is charged too.",
  limits: "Kitabi, Huda and the times (a 10-second timeout, a charge at 8 seconds, a reply at 12) are a made-up course example, and time is sped up. Real apps and providers differ; what matters is that a timeout cannot tell a lost reply from a lost request.",
  scene: {
    width: 420,
    height: 260,
    actors: [
      { id: "phone", label: "Huda", kind: "phone", sub: "Kitabi app", x: 60, y: 200 },
      { id: "api", label: "Kitabi API", kind: "server", sub: "payments", x: 210, y: 100 },
      { id: "provider", label: "Provider", kind: "server", sub: "slow today", x: 360, y: 200 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "phone", to: "api", label: "Pay $18" },
      { kind: "wait", at: 1.0, dur: 2.0, actor: "phone", label: "waiting {n} s", doneLabel: "gave up at 10 s", total: 10 },
      { kind: "fly", at: 1.0, dur: 0.8, from: "api", to: "provider", label: "charge $18" },
      { kind: "say", at: 1.8, actor: "provider", text: "charged: 1", tone: "warn" },
      { kind: "say", at: 3.0, actor: "phone", text: "try again?", tone: "warn" },
      { kind: "fly", at: 2.2, dur: 1.4, from: "provider", to: "api", label: "OK (late)" },
      { kind: "say", at: 3.6, actor: "api", text: "reply too late" },
      { kind: "fly", at: 3.8, dur: 0.7, from: "phone", to: "api", label: "Pay $18 again" },
      { kind: "fly", at: 4.5, dur: 0.7, from: "api", to: "provider", label: "charge $18" },
      { kind: "say", at: 5.2, actor: "provider", text: "charged: 2", tone: "bad" },
      { kind: "mark", at: 5.2, actor: "provider", tone: "bad" },
      { kind: "fly", at: 5.4, dur: 0.6, from: "provider", to: "api", label: "OK" },
      { kind: "fly", at: 6.0, dur: 0.6, from: "api", to: "phone", label: "paid" },
      { kind: "say", at: 6.6, actor: "phone", text: "paid twice", tone: "bad" },
      { kind: "verdict", at: 6.7, text: "One tap, a timeout, two charges", tone: "bad" },
    ],
    loop: 9.6,
  },
};
