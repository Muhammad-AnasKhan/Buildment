import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 13.7 beat 7: Two replicas can each allow a withdrawal, and the balance goes negative.
export const sysdesignM13CrdtLimit: SceneSpec = {
  kind: "scene",
  title: "Two replicas can each allow a withdrawal, and the balance goes negative",
  purpose: "A balance of 100 is kept as a PN-Counter on two replicas. Each sees 100, lets a user withdraw 80, and shows 20. After the merge the balance is -60.",
  limits: "Two replicas, a made-up bank balance and no coordination. Keeping a rule such as balance at least 0 needs agreement between replicas (modules 11 and 12).",
  scene: {
    width: 420,
    height: 230,
    actors: [
      { id: "a", label: "Branch A", kind: "database", sub: "balance: 100", x: 60, y: 115 },
      { id: "b", label: "Branch B", kind: "database", sub: "balance: 100", x: 360, y: 115 },
    ],
    events: [
      { kind: "say", at: 0.5, actor: "a", text: "pays 80: OK", tone: "good" },
      { kind: "say", at: 0.5, actor: "b", text: "pays 80: OK", tone: "good" },
      { kind: "say", at: 1.5, actor: "a", text: "balance: 20", tone: "accent" },
      { kind: "say", at: 1.5, actor: "b", text: "balance: 20", tone: "accent" },
      { kind: "fly", at: 2.4, dur: 1.5, from: "a", to: "b", label: "down A:80" },
      { kind: "fly", at: 2.4, dur: 1.5, from: "b", to: "a", label: "down B:80" },
      { kind: "say", at: 4.1, actor: "a", text: "balance: -60", tone: "bad" },
      { kind: "say", at: 4.1, actor: "b", text: "balance: -60", tone: "bad" },
      { kind: "verdict", at: 4.5, text: "Both withdrawals OK; balance is -60", tone: "bad" },
    ],
    loop: 7.5,
  },
};
