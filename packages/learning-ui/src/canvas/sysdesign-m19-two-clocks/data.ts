import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 19.3 beat 2 (Two clocks: how much, how long). Nightly backup at 02:00, failure at 14:07, back at 15:24.
export const sysdesignM19TwoClocks: SceneSpec = {
  kind: "scene",
  title: "A failure at 14:07 starts two clocks",
  purpose: "The last good copy is from 02:00. The database fails at 14:07. The orders written since 02:00 are gone, and the app stays down until the restore finishes at 15:24.",
  limits: "One day with a nightly backup, a 1 TB database restored at 250 MB per second and 10 minutes to switch the app over. All of these are made-up course numbers.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "orders", label: "Orders", kind: "database", sub: "since 02:00", x: 105, y: 110 },
      { id: "app", label: "App", kind: "server", sub: "serving", x: 315, y: 110 },
    ],
    strip: { y: 296, from: 0, to: 24, unit: "h", caption: "time of day, hours", every: 4 },
    events: [
      { kind: "tag", at: 0.4, row: 0, value: 2, label: "Last copy 02:00", tone: "good" },
      { kind: "tag", at: 1.4, row: 1, value: 14.1, label: "Failure 14:07", tone: "bad" },
      { kind: "say", at: 1.4, actor: "orders", text: "disk lost", tone: "bad" },
      { kind: "say", at: 1.4, actor: "app", text: "down", tone: "bad" },
      { kind: "say", at: 2.4, actor: "orders", text: "lost 12 h 7 min", tone: "bad" },
      { kind: "mark", at: 2.4, actor: "orders", tone: "bad" },
      { kind: "tag", at: 3.4, row: 0, value: 15.4, label: "Back 15:24", tone: "good" },
      { kind: "say", at: 3.4, actor: "app", text: "down 77 min", tone: "warn" },
      { kind: "verdict", at: 4.4, text: "RPO is data lost, RTO is time down", tone: "accent" },
    ],
    loop: 7.4,
  },
};
