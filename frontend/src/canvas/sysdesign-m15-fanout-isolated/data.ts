import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.7 beat 3: One subscriber fails; the others carry on.
export const sysdesignM15FanoutIsolated: SceneSpec = {
  kind: "scene",
  title: "One subscriber fails; the others carry on",
  purpose: "Each subscriber has its own queue, retries and dead letter queue. The receipts job keeps failing and is parked, while email goes on sending.",
  limits: "Two subscribers. If they shared one queue, a failing job would block both, which is why each gets its own.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "topic", label: "Topic", kind: "queue", sub: "OrderPlaced", x: 60, y: 190 },
      { id: "email", label: "Email", kind: "worker", sub: "its own queue", x: 330, y: 105 },
      { id: "receipts", label: "Receipts", kind: "worker", sub: "its own queue", x: 330, y: 245 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 0.8, from: "topic", to: "email", label: "event 1" },
      { kind: "fly", at: 0.4, dur: 0.8, from: "topic", to: "receipts", label: "event 1" },
      { kind: "say", at: 1.4, actor: "email", text: "sent", tone: "good" },
      { kind: "say", at: 1.4, actor: "receipts", text: "fails: retrying", tone: "warn" },
      { kind: "fly", at: 2.6, dur: 0.8, from: "topic", to: "email", label: "event 2" },
      { kind: "fly", at: 2.6, dur: 0.8, from: "topic", to: "receipts", label: "event 2" },
      { kind: "say", at: 3.6, actor: "email", text: "sent", tone: "good" },
      { kind: "say", at: 3.6, actor: "receipts", text: "own dead queue", tone: "warn" },
      { kind: "verdict", at: 4.4, text: "One subscriber fails, others go on", tone: "good" },
    ],
    loop: 7.4,
  },
};
