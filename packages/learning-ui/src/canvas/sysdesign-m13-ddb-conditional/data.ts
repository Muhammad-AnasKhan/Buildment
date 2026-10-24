import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 13.4 beat 4: A conditional write is refused when the item has changed.
export const sysdesignM13DdbConditional: SceneSpec = {
  kind: "scene",
  title: "A conditional write is refused when the item has changed",
  purpose: "Hana and Dina both read the cart at version 4. Hana saves first. Dina's save says: only if the version is still 4. The item is at 5, so it is refused, and Dina reads again and retries.",
  limits: "One item and a version attribute that the app maintains. DynamoDB conditional writes check any attribute you name (S42); a version number is the usual pattern.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "hana", label: "Hana", kind: "phone", sub: "read v 4", x: 60, y: 100 },
      { id: "dina", label: "Dina", kind: "user", sub: "read v 4", x: 360, y: 100 },
      { id: "item", label: "Cart item", kind: "database", sub: "version 4", x: 210, y: 205 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 0.9, from: "hana", to: "item", label: "put if v = 4" },
      { kind: "say", at: 1.3, actor: "item", text: "saved v 5", tone: "good" },
      { kind: "fly", at: 2, dur: 0.9, from: "dina", to: "item", label: "put if v = 4" },
      { kind: "say", at: 2.9, actor: "item", text: "v is 5: refused", tone: "bad" },
      { kind: "mark", at: 2.9, actor: "item", tone: "bad" },
      { kind: "say", at: 3.3, actor: "dina", text: "read, retry", tone: "warn" },
      { kind: "fly", at: 3.9, dur: 0.9, from: "dina", to: "item", label: "put if v = 5" },
      { kind: "say", at: 4.8, actor: "item", text: "saved v 6", tone: "good" },
      { kind: "verdict", at: 5, text: "Stale write refused; nothing lost", tone: "good" },
    ],
    loop: 8,
  },
};
