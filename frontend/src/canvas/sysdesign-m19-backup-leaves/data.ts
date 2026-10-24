import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 19.6 beat 4 (A backup can break the rule). EU customers' backup must stay inside the EU.
export const sysdesignM19BackupLeaves: SceneSpec = {
  kind: "scene",
  title: "The backup copy must stay in the EU",
  purpose: "A rule says EU customers' data stays in the EU. A backup job that copies to a North America region breaks the rule. A backup to a second EU site keeps it.",
  limits: "A made-up rule and made-up sites. The real rule depends on the law, the contract and the type of data, and your legal team decides it. Engineers build to the rule they are given.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "eu", label: "EU database", kind: "database", sub: "EU customers", x: 62, y: 150 },
      { id: "na", label: "NA storage", kind: "database", sub: "outside the EU", x: 358, y: 100 },
      { id: "eu2", label: "EU site 2", kind: "database", sub: "inside the EU", x: 358, y: 215 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1.3, from: "eu", to: "na", label: "nightly backup", tone: "bad" },
      { kind: "say", at: 1.7, actor: "na", text: "has EU data", tone: "bad" },
      { kind: "mark", at: 1.7, actor: "na", tone: "bad" },
      { kind: "verdict", at: 1.8, text: "Backup crossed the border", tone: "bad" },
      { kind: "say", at: 3.4, actor: "na", text: "not allowed", tone: "bad" },
      { kind: "fly", at: 3.6, dur: 1.3, from: "eu", to: "eu2", label: "nightly backup", tone: "good" },
      { kind: "say", at: 5, actor: "eu2", text: "has EU data", tone: "good" },
      { kind: "mark", at: 5, actor: "eu2", tone: "good" },
      { kind: "verdict", at: 5.1, text: "Backup stays inside the EU", tone: "good" },
    ],
    loop: 8.4,
  },
};
