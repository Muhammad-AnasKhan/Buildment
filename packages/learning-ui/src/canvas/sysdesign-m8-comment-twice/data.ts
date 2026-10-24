import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 8.1 beat 1 ("It looked lost, so she posted twice"). A replica answers from what it has. A user can post something and then load a page that does not show it.
export const sysdesignM8CommentTwice: SceneSpec = {
  kind: "scene",
  title: "Layla's comment looks lost, so she posts twice",
  purpose: "Her comment goes to the leader, her reload is answered by a replica that has not got the copy yet, so the page shows no comment and she posts again.",
  limits: "Layla, the app and the timing are a course story. The copy takes about 3.4 seconds here so you can watch it; a real replica is usually well under a second behind. One replica is drawn.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "layla", label: "Layla", kind: "phone", sub: "comments: 0", x: 60, y: 160 },
      { id: "app", label: "App", kind: "server", sub: "web server", x: 210, y: 160 },
      { id: "leader", label: "Leader", kind: "database", sub: "comments: 0", x: 360, y: 90 },
      { id: "replica", label: "Replica", kind: "database", sub: "comments: 0", x: 360, y: 230 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.6, from: "layla", to: "app", label: "post" },
      { kind: "fly", at: 0.8, dur: 0.6, from: "app", to: "leader", label: "write" },
      { kind: "say", at: 1.4, actor: "leader", text: "comments: 1", tone: "good" },
      { kind: "fly", at: 1.5, dur: 0.6, from: "leader", to: "app", label: "ok" },
      { kind: "say", at: 2.1, actor: "layla", text: "posted!", tone: "good" },
      { kind: "fly", at: 1.7, dur: 3.4, from: "leader", to: "replica", label: "copy (slow)" },
      { kind: "fly", at: 2.5, dur: 0.6, from: "layla", to: "app", label: "reload" },
      { kind: "fly", at: 3.1, dur: 0.6, from: "app", to: "replica", label: "read" },
      { kind: "mark", at: 3.7, actor: "replica", tone: "bad" },
      { kind: "fly", at: 3.8, dur: 0.6, from: "replica", to: "app", label: "0 comments", tone: "bad" },
      { kind: "fly", at: 4.4, dur: 0.6, from: "app", to: "layla", label: "0 comments", tone: "bad" },
      { kind: "say", at: 5, actor: "layla", text: "it is gone!", tone: "bad" },
      { kind: "say", at: 5.1, actor: "replica", text: "comments: 1", tone: "good" },
      { kind: "fly", at: 5.4, dur: 0.6, from: "layla", to: "app", label: "post again" },
      { kind: "fly", at: 6, dur: 0.6, from: "app", to: "leader", label: "write" },
      { kind: "say", at: 6.6, actor: "leader", text: "comments: 2", tone: "bad" },
      { kind: "verdict", at: 6.7, text: "Looked lost, so she posted twice", tone: "bad" },
    ],
    loop: 9.6,
  },
};
