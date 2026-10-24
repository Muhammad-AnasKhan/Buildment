import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 25.3 beat 4: A refund is new entries that cancel the sale. Nothing is edited or deleted.
export const sysdesignM25Reversal: SceneSpec = {
  kind: "scene",
  title: "A refund adds lines; it never edits the sale",
  purpose: "The ledger holds a sale of 3 entries. The refund job adds 3 new entries that swap every debit and credit. The ledger now has 6 entries, the balances are back to zero, and an auditor can still see both.",
  limits: "One sale of 100 split into a 90 organizer share and a 10 fee, a course example. A real refund may return only part of the sale, which is a second, smaller reversal.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "app", label: "Refund job", kind: "server", sub: "customer asks", x: 70, y: 100 },
      { id: "ledger", label: "Ledger", kind: "database", sub: "3 entries", x: 350, y: 100 },
      { id: "audit", label: "Auditor", kind: "user", sub: "reads history", x: 210, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1.0, from: "app", to: "ledger", label: "refund: 3 new lines" },
      { kind: "say", at: 1.3, actor: "ledger", text: "6 entries", tone: "good" },
      { kind: "say", at: 1.5, actor: "app", text: "nothing edited", tone: "good" },
      { kind: "fly", at: 2.4, dur: 0.9, from: "audit", to: "ledger", label: "show history" },
      { kind: "fly", at: 3.4, dur: 0.9, from: "ledger", to: "audit", label: "sale + refund", tone: "good" },
      { kind: "say", at: 4.3, actor: "audit", text: "both visible", tone: "good" },
      { kind: "verdict", at: 4.6, text: "Undo by adding, never by editing", tone: "good" },
    ],
    loop: 8,
  },
};
