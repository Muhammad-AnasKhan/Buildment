import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.4 beat 3. A lost update happens when two transactions read the same value, then each writes a number computed from what it read. The later write silently replaces the earlier one.
export const sysdesignM7LostUpdate: SceneSpec = {
  kind: "scene",
  title: "Two top-ups read 100 and one is lost",
  purpose: "Amna adds 50 and Bilal adds 30 to the same wallet. Each reads 100 and writes back a total, so the second write erases the first.",
  limits: "Names and amounts are made up. This is the same shape as the last-ticket race, with money. Writing 'balance = balance + 30' inside one statement, or locking the row, avoids it (chapter 7.5).",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "amna", label: "Amna", kind: "phone", sub: "adds 50", x: 60, y: 100 },
      { id: "bilal", label: "Bilal", kind: "phone", sub: "adds 30", x: 360, y: 100 },
      { id: "db", label: "Wallet", kind: "database", sub: "balance 100", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.6, from: "amna", to: "db", label: "read" },
      { kind: "fly", at: 0.5, dur: 0.6, from: "bilal", to: "db", label: "read" },
      { kind: "fly", at: 1.2, dur: 0.6, from: "db", to: "amna", label: "100", tone: "good" },
      { kind: "fly", at: 1.3, dur: 0.6, from: "db", to: "bilal", label: "100", tone: "good" },
      { kind: "fly", at: 2.1, dur: 0.7, from: "amna", to: "db", label: "write 150" },
      { kind: "say", at: 2.8, actor: "db", text: "balance 150", tone: "good" },
      { kind: "fly", at: 3.2, dur: 0.7, from: "bilal", to: "db", label: "write 130" },
      { kind: "say", at: 3.9, actor: "db", text: "balance 130", tone: "bad" },
      { kind: "mark", at: 3.9, actor: "db", tone: "bad" },
      { kind: "verdict", at: 4.3, text: "Final 130, but 180 was owed", tone: "bad" },
    ],
    loop: 7.1,
  },
};
