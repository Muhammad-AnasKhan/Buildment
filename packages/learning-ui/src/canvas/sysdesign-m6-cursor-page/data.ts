import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 6.3 beat 3: the same story with a cursor. Page 2 asks for books listed
// before book 7, so a new book at the top changes nothing.
export const sysdesignM6CursorPage: SceneSpec = {
  kind: "scene",
  title: "A cursor remembers where you stopped",
  purpose: "Page 1 returns a cursor pointing at book 7; after a new book is listed, page 2 asks for books before book 7 and gets 6, 5 and 4.",
  limits: "The cursor is shown as 'after 7'; a real cursor is an opaque string holding the last row's sort key, such as its listing time and id. Pages of 3 are illustrative.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "phone", label: "Huda", kind: "phone", sub: "page 1 next", x: 60, y: 110 },
      { id: "api", label: "Kitabi API", kind: "server", sub: "newest first", x: 360, y: 110 },
      { id: "seller", label: "Seller", kind: "user", sub: "has a book", x: 210, y: 220 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "phone", to: "api", label: "first page" },
      { kind: "fly", at: 1.0, dur: 0.8, from: "api", to: "phone", label: "9, 8, 7 + cursor" },
      { kind: "say", at: 1.8, actor: "phone", text: "cursor: after 7" },
      { kind: "fly", at: 2.1, dur: 0.8, from: "seller", to: "api", label: "list book 10" },
      { kind: "say", at: 2.9, actor: "api", text: "10 on top" },
      { kind: "say", at: 2.9, actor: "seller", text: "listed" },
      { kind: "fly", at: 3.3, dur: 0.8, from: "phone", to: "api", label: "?after=7" },
      { kind: "say", at: 4.1, actor: "api", text: "older than 7" },
      { kind: "fly", at: 4.3, dur: 0.8, from: "api", to: "phone", label: "6, 5, 4", tone: "good" },
      { kind: "say", at: 5.1, actor: "phone", text: "no repeats", tone: "good" },
      { kind: "verdict", at: 5.3, text: "After book 7: no repeats, no gaps", tone: "good" },
    ],
    loop: 8.3,
  },
};
