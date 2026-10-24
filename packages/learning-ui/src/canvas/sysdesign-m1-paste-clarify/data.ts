import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Beat 2 of 1.4: clarify. Before drawing PasteBox (a fictional pastebin),
// the designer asks three questions; each answer becomes a fixed fact.
export const sysdesignM1PasteClarify: SceneSpec = {
  kind: "scene",
  title: "Clarify: three questions fix the scope",
  purpose: "The designer asks the product lead how big a paste can be, how long it is kept and whether it can be edited; each answer is written down.",
  limits: "A fictional product lead with ready answers. In real work some answers take a meeting, and some come back as 'we do not know yet'; then you write down an assumption and check it later.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "you", label: "You", kind: "user", sub: "designer", x: 70, y: 110 },
      { id: "lead", label: "Owner", kind: "user", sub: "product lead", x: 330, y: 110 },
      { id: "scope", label: "Scope", kind: "database", sub: "no facts yet", x: 200, y: 228 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 0.8, from: "you", to: "lead", label: "How big?" },
      { kind: "say", at: 0.8, actor: "lead", text: "up to 1 MB" },
      { kind: "fly", at: 0.9, dur: 0.6, from: "lead", to: "scope", label: "1 MB max" },
      { kind: "say", at: 1.5, actor: "scope", text: "1 MB max", tone: "accent" },

      { kind: "fly", at: 2.0, dur: 0.8, from: "you", to: "lead", label: "Kept how long?" },
      { kind: "say", at: 2.8, actor: "lead", text: "30 days" },
      { kind: "fly", at: 2.9, dur: 0.6, from: "lead", to: "scope", label: "30 days" },
      { kind: "say", at: 3.5, actor: "scope", text: "1 MB, 30 days", tone: "accent" },

      { kind: "fly", at: 4.0, dur: 0.8, from: "you", to: "lead", label: "Edit later?" },
      { kind: "say", at: 4.8, actor: "lead", text: "no edits" },
      { kind: "fly", at: 4.9, dur: 0.6, from: "lead", to: "scope", label: "read-only" },
      { kind: "say", at: 5.5, actor: "scope", text: "3 facts fixed", tone: "good" },
      { kind: "verdict", at: 5.8, text: "Scope fixed before any drawing", tone: "good" },
    ],
    loop: 8.8,
  },
};
