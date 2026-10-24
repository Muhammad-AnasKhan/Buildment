import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 23.2 beat 7: A saved product sits in a buffer until the next refresh makes it searchable.
export const sysdesignM23RefreshLag: SceneSpec = {
  kind: "scene",
  title: "A saved product is searchable only after the next refresh",
  purpose: "A seller adds a product. The index keeps it in a buffer where searches cannot see it yet. A shopper searches and finds nothing. After the next refresh, the same search finds it.",
  limits: "The refresh time is shortened so the story fits. A real refresh runs on a timer, for example once a second, and a big write burst can make the wait longer. The product database itself is updated at once.",
  scene: {
    width: 420,
    height: 310,
    actors: [
      { id: "seller", label: "Seller", kind: "user", sub: "adds product", x: 350, y: 100 },
      { id: "index", label: "Index", kind: "database", sub: "searchable", x: 70, y: 170 },
      { id: "shopper", label: "Shopper", kind: "phone", sub: "searches", x: 350, y: 240 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "seller", to: "index", label: "new product" },
      { kind: "say", at: 1.2, actor: "index", text: "in a buffer", tone: "warn" },
      { kind: "fly", at: 1.5, dur: 0.9, from: "shopper", to: "index", label: "search" },
      { kind: "fly", at: 2.5, dur: 0.9, from: "index", to: "shopper", label: "no match", tone: "bad" },
      { kind: "say", at: 3.4, actor: "shopper", text: "sees nothing", tone: "bad" },
      { kind: "wait", at: 3.6, dur: 1.4, actor: "index", label: "refresh {n} s", doneLabel: "refreshed", total: 1 },
      { kind: "say", at: 5.0, actor: "index", text: "now searchable", tone: "good" },
      { kind: "fly", at: 5.3, dur: 0.9, from: "shopper", to: "index", label: "search" },
      { kind: "fly", at: 6.3, dur: 0.9, from: "index", to: "shopper", label: "found it", tone: "good" },
      { kind: "say", at: 7.2, actor: "shopper", text: "sees product", tone: "good" },
      { kind: "verdict", at: 7.3, text: "Visible after the next refresh", tone: "good" },
    ],
    loop: 10.5,
  },
};
