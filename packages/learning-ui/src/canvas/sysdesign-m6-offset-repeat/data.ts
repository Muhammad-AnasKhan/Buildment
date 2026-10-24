import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 6.3 beat 2: offset pagination, newest first, 3 per page. A new book lands
// at the top between page 1 and page 2, so offset 3 starts at book 7 again.
export const sysdesignM6OffsetRepeat: SceneSpec = {
  kind: "scene",
  title: "Offset pages repeat when a row arrives",
  purpose: "Huda reads page 1, a seller lists a new book at the top, and page 2 at offset 3 starts with a book she has already seen.",
  limits: "Pages of 3 books and one new book keep the counting easy; real pages are larger. A deleted book would cause the opposite problem: a book skipped instead of repeated.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "phone", label: "Huda", kind: "phone", sub: "page 1 next", x: 60, y: 110 },
      { id: "api", label: "Kitabi API", kind: "server", sub: "newest first", x: 360, y: 110 },
      { id: "seller", label: "Seller", kind: "user", sub: "has a book", x: 210, y: 220 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "phone", to: "api", label: "?offset=0" },
      { kind: "fly", at: 1.0, dur: 0.8, from: "api", to: "phone", label: "9, 8, 7" },
      { kind: "say", at: 1.8, actor: "phone", text: "saw 9, 8, 7" },
      { kind: "fly", at: 2.1, dur: 0.8, from: "seller", to: "api", label: "list book 10" },
      { kind: "say", at: 2.9, actor: "api", text: "10, 9, 8, 7 ..." },
      { kind: "say", at: 2.9, actor: "seller", text: "listed" },
      { kind: "fly", at: 3.3, dur: 0.8, from: "phone", to: "api", label: "?offset=3" },
      { kind: "say", at: 4.1, actor: "api", text: "skip 10, 9, 8" },
      { kind: "fly", at: 4.3, dur: 0.8, from: "api", to: "phone", label: "7, 6, 5", tone: "warn" },
      { kind: "say", at: 5.1, actor: "phone", text: "book 7 again", tone: "bad" },
      { kind: "mark", at: 5.1, actor: "phone", tone: "bad" },
      { kind: "verdict", at: 5.3, text: "Offset 3 now starts at book 7 again", tone: "bad" },
    ],
    loop: 8.3,
  },
};
