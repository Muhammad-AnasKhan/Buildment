import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 21.3 beat 1 (Push: copy the post into every timeline)
export const sysdesignM21PushPost: SceneSpec = {
  kind: "scene",
  title: "Push: one post becomes one write per follower",
  purpose: "Dina posts. A fan-out worker looks up her three followers and adds the post id to each follower's timeline. Opening the feed later only reads one ready list.",
  limits: "Three followers to keep the picture readable. Dina's real count is 100. The worker runs after the post is saved, so a follower may see the post a few seconds late.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "dina", label: "Dina", kind: "phone", sub: "posts", x: 70, y: 85 },
      { id: "worker", label: "Fan-out", kind: "worker", sub: "3 followers", x: 70, y: 235 },
      { id: "t1", label: "Omar", kind: "cache", sub: "timeline", x: 350, y: 80 },
      { id: "t2", label: "Lina", kind: "cache", sub: "timeline", x: 350, y: 160 },
      { id: "t3", label: "Sami", kind: "cache", sub: "timeline", x: 350, y: 240 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "dina", to: "worker", label: "new post" },
      { kind: "say", at: 1, actor: "worker", text: "copy to each", tone: "accent" },
      { kind: "fly", at: 1.3, dur: 0.7, from: "worker", to: "t1", label: "post 42" },
      { kind: "fly", at: 1.7, dur: 0.7, from: "worker", to: "t2", label: "post 42" },
      { kind: "fly", at: 2.1, dur: 0.7, from: "worker", to: "t3", label: "post 42" },
      { kind: "say", at: 2, actor: "t1", text: "+1 post", tone: "good" },
      { kind: "say", at: 2.4, actor: "t2", text: "+1 post", tone: "good" },
      { kind: "say", at: 2.8, actor: "t3", text: "+1 post", tone: "good" },
      { kind: "verdict", at: 3, text: "Push: one write per follower", tone: "good" },
    ],
    loop: 6,
  },
};
