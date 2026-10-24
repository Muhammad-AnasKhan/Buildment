import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 25.3 beat 5: The provider sends the same event twice. The ledger posts it once, keyed by the event id.
export const sysdesignM25SameEventTwice: SceneSpec = {
  kind: "scene",
  title: "The same event twice posts once",
  purpose: "The provider sends the paid event for pay_91, does not get a reply in time, and sends it again. The worker posts both to the ledger under the same id. The ledger accepts the first and sees that the second is already known.",
  limits: "The ids (pay_91) are made up. This is the idempotency idea from chapters 6.4 and 14.5 applied at the ledger: the unique key is the event or payment id, and it must live in the same place as the entries.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "prov", label: "Provider", kind: "server", sub: "sends events", x: 70, y: 100 },
      { id: "worker", label: "Worker", kind: "worker", sub: "posts entries", x: 350, y: 100 },
      { id: "ledger", label: "Ledger", kind: "database", sub: "empty", x: 210, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "prov", to: "worker", label: "paid pay_91" },
      { kind: "fly", at: 1.4, dur: 0.9, from: "worker", to: "ledger", label: "post pay_91" },
      { kind: "say", at: 2.3, actor: "ledger", text: "1 posting", tone: "good" },
      { kind: "say", at: 2.5, actor: "prov", text: "no reply, retry", tone: "warn" },
      { kind: "fly", at: 3.0, dur: 0.9, from: "prov", to: "worker", label: "paid pay_91", tone: "warn" },
      { kind: "fly", at: 4.0, dur: 0.9, from: "worker", to: "ledger", label: "post pay_91", tone: "warn" },
      { kind: "say", at: 4.9, actor: "ledger", text: "pay_91 known", tone: "accent" },
      { kind: "fly", at: 5.1, dur: 0.8, from: "ledger", to: "worker", label: "already posted" },
      { kind: "say", at: 5.9, actor: "worker", text: "skips it", tone: "good" },
      { kind: "verdict", at: 6.2, text: "The second copy changes nothing", tone: "good" },
    ],
    loop: 9.5,
  },
};
