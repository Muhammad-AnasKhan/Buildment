import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 14.5 beat 1 (Why a message comes twice).
export const sysdesignM14AckLost: SceneSpec = {
  kind: "scene",
  title: "The consumer works, the ack is lost, the broker sends again",
  purpose: "The consumer adds 18 to a wallet and dies before it acknowledges. The broker waits, times out, and delivers the same message again.",
  limits: "The wallet and the 18 are made up. The timeout is slowed down; SQS standard queues use a 30 second visibility timeout by default.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "broker", label: "Broker", kind: "queue", sub: "has m-7", x: 60, y: 90 },
      { id: "cons", label: "Consumer", kind: "worker", sub: "listening", x: 360, y: 90 },
      { id: "wallet", label: "Wallet", kind: "database", sub: "balance 0", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "broker", to: "cons", label: "m-7" },
      { kind: "fly", at: 1.2, dur: 0.8, from: "cons", to: "wallet", label: "add 18" },
      { kind: "say", at: 2, actor: "wallet", text: "balance 18", tone: "good" },
      { kind: "say", at: 2.4, actor: "cons", text: "crashed", tone: "bad" },
      { kind: "mark", at: 2.4, actor: "cons", tone: "bad" },
      { kind: "say", at: 3, actor: "broker", text: "no ack: wait", tone: "warn" },
      { kind: "say", at: 3.8, actor: "broker", text: "timeout: resend", tone: "warn" },
      { kind: "say", at: 3.8, actor: "cons", text: "restarted", tone: "accent" },
      { kind: "fly", at: 4.1, dur: 0.8, from: "broker", to: "cons", label: "m-7" },
      { kind: "fly", at: 5, dur: 0.8, from: "cons", to: "wallet", label: "add 18" },
      { kind: "say", at: 5.8, actor: "wallet", text: "balance 36", tone: "bad" },
      { kind: "verdict", at: 6.1, text: "Same message, applied twice", tone: "bad" },
    ],
    loop: 9,
  },
};
