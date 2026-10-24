import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 6.4 beat 3: the retry arrives while the first try is still charging. The
// first try claimed k7 atomically (SET NX), so the retry's claim fails: 409.
export const sysdesignM6KeyRace: SceneSpec = {
  kind: "scene",
  title: "Claim the key before you charge",
  purpose: "Try 1 claims key k7 in one atomic step and starts the charge; try 2 arrives during the charge, cannot claim k7, and is told to wait.",
  limits: "One API server is drawn; with several, every server claims in the same key store, so the result is the same. The retry timing is made up for the picture.",
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
      { kind: "fly", at: 0.2, dur: 0.7, from: "phone", to: "api", label: "try 1, k7" },
      { kind: "fly", at: 0.9, dur: 0.5, from: "api", to: "keys", label: "SET k7 NX" },
      { kind: "say", at: 1.4, actor: "keys", text: "k7: claimed", tone: "good" },
      { kind: "fly", at: 1.5, dur: 0.6, from: "api", to: "provider", label: "charge" },
      { kind: "say", at: 2.1, actor: "provider", text: "charging...", tone: "warn" },
      { kind: "fly", at: 1.8, dur: 0.7, from: "phone", to: "api", label: "try 2, k7" },
      { kind: "fly", at: 2.6, dur: 0.5, from: "api", to: "keys", label: "SET k7 NX" },
      { kind: "say", at: 3.1, actor: "keys", text: "taken: refuse", tone: "bad" },
      { kind: "fly", at: 3.3, dur: 0.7, from: "api", to: "phone", label: "409 still running", tone: "warn" },
      { kind: "say", at: 4.0, actor: "phone", text: "wait, ask again", tone: "warn" },
      { kind: "say", at: 4.2, actor: "provider", text: "charged: 1", tone: "good" },
      { kind: "verdict", at: 4.4, text: "Second try refused: 1 charge", tone: "good" },
    ],
    loop: 7.4,
  },
};
