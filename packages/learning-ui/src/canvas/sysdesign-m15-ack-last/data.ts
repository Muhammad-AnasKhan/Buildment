import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.4 beat 2: A worker that acknowledges last repeats the job in a crash.
export const sysdesignM15AckLast: SceneSpec = {
  kind: "scene",
  title: "A worker that acknowledges last repeats the job in a crash",
  purpose: "The worker pays 18, then crashes before the ack. The queue never saw the ack, so it sends the job again and the wallet is paid twice.",
  limits: "The crash point is chosen to show the failure. Chapter 14.5 shows how an idempotent consumer makes the repeat harmless.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "queue", label: "Queue", kind: "queue", sub: "credit 18", x: 60, y: 100 },
      { id: "worker", label: "Worker", kind: "worker", sub: "idle", x: 360, y: 100 },
      { id: "wallet", label: "Wallet", kind: "database", sub: "balance: 0", x: 210, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 0.8, from: "queue", to: "worker", label: "credit 18" },
      { kind: "fly", at: 1.4, dur: 0.8, from: "worker", to: "wallet", label: "pay 18" },
      { kind: "say", at: 2.3, actor: "wallet", text: "balance: 18", tone: "good" },
      { kind: "say", at: 2.7, actor: "worker", text: "crashed", tone: "bad" },
      { kind: "mark", at: 2.7, actor: "worker", tone: "bad" },
      { kind: "say", at: 3.4, actor: "queue", text: "no ack: wait", tone: "warn" },
      { kind: "fly", at: 4.3, dur: 0.8, from: "queue", to: "worker", label: "credit 18" },
      { kind: "fly", at: 5.3, dur: 0.8, from: "worker", to: "wallet", label: "pay 18" },
      { kind: "say", at: 6.2, actor: "wallet", text: "balance: 36", tone: "bad" },
      { kind: "verdict", at: 6.6, text: "Ack last: a crash can repeat the job", tone: "warn" },
    ],
    loop: 9.6,
  },
};
