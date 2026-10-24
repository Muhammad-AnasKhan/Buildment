import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 11.6 beat 5 ("Agreeing is not the same as being right"). Two copies can converge to one value and still lose an update, depending on the merge rule.
export const sysdesignM11CartLost: SceneSpec = {
  kind: "scene",
  title: "The copies agree, and a cart item is gone",
  purpose: "Two copies each got a different item added to the same cart. A rule keeps the cart with the later timestamp. Both copies end up the same, and one item is lost.",
  limits: "A made-up shop and made-up timestamps. Merging the two carts instead (keep both items) is the next module's topic. Real clocks differ by milliseconds, so \"later\" can also be wrong (chapter 10.6).",
  scene: {
    width: 420,
    height: 340,
    actors: [
      { id: "c1", label: "Copy 1", kind: "database", sub: "cart: book", x: 80, y: 105 },
      { id: "c2", label: "Copy 2", kind: "database", sub: "cart: pen", x: 340, y: 105 },
      { id: "rule", label: "Rule", kind: "note", sub: "latest wins", x: 210, y: 245 },
    ],
    events: [
      { kind: "say", at: 0.3, actor: "c1", text: "book at 10", tone: "accent" },
      { kind: "say", at: 0.6, actor: "c2", text: "pen at 12", tone: "accent" },
      { kind: "fly", at: 1.2, dur: 1, from: "c1", to: "rule", label: "book, 10" },
      { kind: "fly", at: 1.2, dur: 1, from: "c2", to: "rule", label: "pen, 12" },
      { kind: "say", at: 2.2, actor: "rule", text: "keep pen", tone: "good" },
      { kind: "fly", at: 2.6, dur: 1, from: "rule", to: "c1", label: "cart: pen" },
      { kind: "fly", at: 2.6, dur: 1, from: "rule", to: "c2", label: "cart: pen" },
      { kind: "say", at: 3.6, actor: "c1", text: "cart: pen", tone: "bad" },
      { kind: "say", at: 3.6, actor: "c2", text: "cart: pen", tone: "good" },
      { kind: "mark", at: 3.7, actor: "c1", tone: "bad" },
      { kind: "verdict", at: 3.9, text: "Copies agree, but the book is gone", tone: "bad" },
    ],
    loop: 7,
  },
};
