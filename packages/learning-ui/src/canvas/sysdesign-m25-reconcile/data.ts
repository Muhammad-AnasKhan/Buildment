import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 25.4 beat 5: Nightly reconciliation compares the provider's report with our ledger.
export const sysdesignM25Reconcile: SceneSpec = {
  kind: "scene",
  title: "Reconciliation: the provider's report against our ledger",
  purpose: "A nightly job reads the provider's report (1,000 payments) and our ledger (998). Two ids are missing on our side. The job asks the provider about pay_412, learns it was captured, and posts it. The other, pay_907, needs a person.",
  limits: "The counts and ids are made up. A real report is a file the provider publishes, with fees and payout dates; the checks shown are the three outcomes every reconciliation has: match, fixable gap, needs a human.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "prov", label: "Provider", kind: "server", sub: "report: 1,000", x: 70, y: 100 },
      { id: "ledger", label: "Ledger", kind: "database", sub: "998 payments", x: 350, y: 100 },
      { id: "job", label: "Nightly job", kind: "worker", sub: "compares ids", x: 210, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "prov", to: "job", label: "1,000 ids" },
      { kind: "fly", at: 1.3, dur: 0.9, from: "ledger", to: "job", label: "998 ids" },
      { kind: "say", at: 2.2, actor: "job", text: "2 are missing", tone: "bad" },
      { kind: "mark", at: 2.2, actor: "job", tone: "bad" },
      { kind: "fly", at: 2.7, dur: 0.9, from: "job", to: "prov", label: "status pay_412?" },
      { kind: "fly", at: 3.7, dur: 0.9, from: "prov", to: "job", label: "captured", tone: "good" },
      { kind: "fly", at: 4.7, dur: 0.9, from: "job", to: "ledger", label: "post pay_412", tone: "good" },
      { kind: "say", at: 5.6, actor: "ledger", text: "999 payments", tone: "good" },
      { kind: "say", at: 5.8, actor: "job", text: "1 left: a human", tone: "warn" },
      { kind: "verdict", at: 6.1, text: "Match it, fix it, or escalate it", tone: "good" },
    ],
    loop: 9.5,
  },
};
