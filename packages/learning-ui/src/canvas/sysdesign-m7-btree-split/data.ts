import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.3 beat 3. A B-tree changes pages in place. An insert into a full page splits it, which writes the old page, a new page and the parent.
export const sysdesignM7BtreeSplit: SceneSpec = {
  kind: "scene",
  title: "A B-tree insert can rewrite three pages",
  purpose: "Key 47 belongs in a leaf page that is full. The page splits in two, and the parent page gets a new pointer.",
  limits: "A page holds 4 keys here so the split is easy to see; a real page holds hundreds. Most inserts find room and touch one leaf page, plus the write-ahead log. A split is the expensive case.",
  scene: {
    width: 420,
    height: 340,
    actors: [
      { id: "app", label: "App", kind: "server", sub: "insert key 47", x: 60, y: 100 },
      { id: "parent", label: "Parent page", kind: "database", sub: "points to 2", x: 260, y: 100 },
      { id: "leaf", label: "Leaf page", kind: "database", sub: "full: 4 keys", x: 110, y: 255 },
      { id: "fresh", label: "New leaf", kind: "database", sub: "empty", x: 310, y: 255 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "app", to: "parent", label: "insert 47" },
      { kind: "fly", at: 1.1, dur: 0.7, from: "parent", to: "leaf", label: "go here" },
      { kind: "say", at: 1.9, actor: "leaf", text: "full: split", tone: "warn" },
      { kind: "mark", at: 1.9, actor: "leaf", tone: "warn" },
      { kind: "fly", at: 2.3, dur: 0.8, from: "leaf", to: "fresh", label: "move half" },
      { kind: "say", at: 3.2, actor: "leaf", text: "2 keys", tone: "good" },
      { kind: "say", at: 3.2, actor: "fresh", text: "2 keys + 47", tone: "good" },
      { kind: "fly", at: 3.5, dur: 0.8, from: "fresh", to: "parent", label: "new pointer" },
      { kind: "say", at: 4.4, actor: "parent", text: "points to 3", tone: "good" },
      { kind: "verdict", at: 4.7, text: "One insert wrote 3 pages", tone: "warn" },
    ],
    loop: 7.5,
  },
};
