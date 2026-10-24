import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 13.5 beat 3: Last write wins on a whole item drops a change to another field.
export const sysdesignM13LwwWholeItem: SceneSpec = {
  kind: "scene",
  title: "Last write wins on a whole item drops a change to another field",
  purpose: "Hana changes the quantity of tea in the cart. Dina adds a gift note to the same item. The two changes do not clash, but the rule keeps the whole item with the later stamp, so one change vanishes.",
  limits: "One item with two fields and made-up stamps, 10 and 12. Applying the rule per field helps here, but it does not make last write wins safe for two changes to the same field.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "hana", label: "Hana", kind: "phone", sub: "qty = 2", x: 60, y: 100 },
      { id: "dina", label: "Dina", kind: "user", sub: "gift note", x: 360, y: 100 },
      { id: "a", label: "Node A", kind: "database", sub: "tea: qty 1", x: 60, y: 205 },
      { id: "b", label: "Node B", kind: "database", sub: "tea: qty 1", x: 360, y: 205 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "hana", to: "a", label: "qty = 2" },
      { kind: "fly", at: 0.3, dur: 0.9, from: "dina", to: "b", label: "gift note" },
      { kind: "say", at: 1.2, actor: "a", text: "qty 2, t = 10", tone: "accent" },
      { kind: "say", at: 1.2, actor: "b", text: "note, t = 12", tone: "accent" },
      { kind: "fly", at: 1.4, dur: 0.8, from: "a", to: "hana", label: "OK", tone: "good" },
      { kind: "fly", at: 1.4, dur: 0.8, from: "b", to: "dina", label: "OK", tone: "good" },
      { kind: "fly", at: 2.7, dur: 1.3, from: "a", to: "b", label: "whole item" },
      { kind: "fly", at: 2.7, dur: 1.3, from: "b", to: "a", label: "whole item" },
      { kind: "say", at: 4.2, actor: "a", text: "qty is 1 again", tone: "bad" },
      { kind: "say", at: 4.2, actor: "b", text: "keeps its item", tone: "good" },
      { kind: "mark", at: 4.2, actor: "a", tone: "bad" },
      { kind: "verdict", at: 4.5, text: "Different fields, yet one edit is lost", tone: "bad" },
    ],
    loop: 7.5,
  },
};
