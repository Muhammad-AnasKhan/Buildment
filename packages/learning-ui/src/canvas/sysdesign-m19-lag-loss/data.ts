import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 19.4 beat 3 (The copy lag is the data you lose). Asynchronous copy to Region B, then Region A crashes.
export const sysdesignM19LagLoss: SceneSpec = {
  kind: "scene",
  title: "Region A crashes with writes still on the way",
  purpose: "Region A confirms each order at once and copies it to Region B a little later. When A crashes, the copies still travelling never arrive.",
  limits: "300 writes a second and a one second copy lag are made-up course numbers. Real lag changes from minute to minute and grows under load.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "users", label: "Customers", kind: "phone", sub: "300 writes/s", x: 62, y: 150 },
      { id: "a", label: "Region A", kind: "database", sub: "primary", x: 210, y: 150 },
      { id: "b", label: "Region B", kind: "database", sub: "copy", x: 358, y: 150 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "users", to: "a", label: "order" },
      { kind: "fly", at: 1, dur: 0.7, from: "a", to: "users", label: "ok", tone: "good" },
      { kind: "fly", at: 1.1, dur: 1.4, from: "a", to: "b", label: "copy", tone: "warn" },
      { kind: "fly", at: 1.6, dur: 0.7, from: "users", to: "a", label: "order" },
      { kind: "fly", at: 2.3, dur: 0.7, from: "a", to: "users", label: "ok", tone: "good" },
      { kind: "say", at: 2.5, actor: "a", text: "crashed", tone: "bad" },
      { kind: "mark", at: 2.5, actor: "a", tone: "bad" },
      { kind: "say", at: 3.4, actor: "b", text: "missing 300", tone: "bad" },
      { kind: "verdict", at: 3.8, text: "300 acknowledged writes never arrived", tone: "bad" },
    ],
    loop: 7,
  },
};
