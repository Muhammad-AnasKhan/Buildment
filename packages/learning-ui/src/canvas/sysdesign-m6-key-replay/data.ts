import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 6.4 beat 2: the app sends key k7 with the payment and again with the retry.
// The API saved the reply under k7, so the retry gets it back: one charge.
export const sysdesignM6KeyReplay: SceneSpec = {
  kind: "scene",
  title: "Same key, same answer",
  purpose: "The first try charges the card and saves the reply under key k7; the retry carries k7, finds the saved reply and does not charge again.",
  limits: "Here the retry arrives after the first try has finished and been saved. A retry that arrives while the first try is still running is the next beat. The 10-second timeout is a made-up course number.",
  scene: {
    width: 420,
    height: 260,
    actors: [
      { id: "phone", label: "Huda", kind: "phone", sub: "key k7", x: 60, y: 200 },
      { id: "api", label: "Kitabi API", kind: "server", sub: "payments", x: 210, y: 110 },
      { id: "provider", label: "Provider", kind: "server", sub: "slow today", x: 360, y: 90 },
      { id: "keys", label: "Key store", kind: "cache", sub: "empty", x: 360, y: 200 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "phone", to: "api", label: "Pay, key k7" },
      { kind: "wait", at: 1.0, dur: 1.8, actor: "phone", label: "waiting {n} s", doneLabel: "timed out", total: 10 },
      { kind: "fly", at: 1.0, dur: 0.6, from: "api", to: "provider", label: "charge" },
      { kind: "say", at: 1.6, actor: "provider", text: "charged: 1", tone: "warn" },
      { kind: "fly", at: 1.9, dur: 0.6, from: "provider", to: "api", label: "OK" },
      { kind: "fly", at: 2.5, dur: 0.6, from: "api", to: "keys", label: "save k7 reply" },
      { kind: "say", at: 3.1, actor: "keys", text: "k7: paid", tone: "good" },
      { kind: "fly", at: 3.4, dur: 0.8, from: "phone", to: "api", label: "retry, key k7" },
      { kind: "fly", at: 4.2, dur: 0.5, from: "api", to: "keys", label: "seen k7?" },
      { kind: "fly", at: 4.7, dur: 0.5, from: "keys", to: "api", label: "saved reply" },
      { kind: "fly", at: 5.2, dur: 0.7, from: "api", to: "phone", label: "paid (saved)", tone: "good" },
      { kind: "say", at: 5.9, actor: "phone", text: "paid once", tone: "good" },
      { kind: "verdict", at: 6.0, text: "Retry got the saved reply: 1 charge", tone: "good" },
    ],
    loop: 9.0,
  },
};
