import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 10.7 beat 2: random 128-bit IDs need no talking, but new rows land at
// random places in a sorted index.
export const sysdesignM10IdRandom: SceneSpec = {
  kind: "scene",
  title: "Random IDs need no talking, and have no order",
  purpose: "Three servers each make a random ID with no message between them. They never clash in practice, but the new rows land at random places along the sorted index.",
  limits: "A version 4 UUID has 122 random bits (RFC 9562). Clashes are possible in theory but not in practice. The position on the strip is the first byte of each ID as a share of 256, so it is only a picture of where an ID falls in sorted order.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "s1", label: "Server 1", kind: "server", sub: "making an ID", x: 60, y: 100 },
      { id: "s2", label: "Server 2", kind: "server", sub: "making an ID", x: 210, y: 100 },
      { id: "s3", label: "Server 3", kind: "server", sub: "making an ID", x: 360, y: 100 },
    ],
    strip: { y: 300, from: 0, to: 100, unit: "%", caption: "where the new row lands in the index", every: 25 },
    events: [
      { kind: "say", at: 0.6, actor: "s1", text: "9f3c71e0", tone: "accent" },
      { kind: "tag", at: 0.7, row: 0, value: 62, label: "9f3c", tone: "accent" },
      { kind: "say", at: 1.4, actor: "s2", text: "02ab9e44", tone: "accent" },
      { kind: "tag", at: 1.5, row: 0, value: 1, label: "02ab", tone: "accent" },
      { kind: "say", at: 2.2, actor: "s3", text: "e71d40b8", tone: "accent" },
      { kind: "tag", at: 2.3, row: 0, value: 90, label: "e71d", tone: "accent" },
      { kind: "verdict", at: 3.2, text: "No talking needed, but no order", tone: "warn" },
    ],
    loop: 6.6,
  },
};
