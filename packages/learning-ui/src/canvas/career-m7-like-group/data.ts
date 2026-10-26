import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), 7.1 beat 2: a group that agrees in advance to like each other's posts brings the same few likes and no founders. Card register. Amjad is fictional; checked 2026-10.
export const careerM7LikeGroup: SceneSpec = {
  kind: "scene",
  title: "A group that likes everything",
  purpose: "Amjad joins a group whose members agree to like each other's posts. His posts get the same few likes every time. The founders he wanted to reach do not reply.",
  limits: "LinkedIn's Community Policies do not use the word pod; they say not to agree with others ahead of time to like or re-share each other's content. Rules change; checked 2026-10.",
  hint: "Likes from the same few people.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "group", label: "The group", kind: "user", sub: "agreed to like", x: 62, y: 110 },
      { id: "post", label: "His posts", kind: "note", sub: "same few likes", x: 358, y: 110 },
      { id: "founders", label: "Founders", kind: "user", sub: "he wanted them", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "group", to: "post", label: "likes" },
      { kind: "fly", at: 1.6, dur: 1, from: "group", to: "post", label: "likes again" },
      { kind: "say", at: 2.8, actor: "post", text: "same few likes", tone: "warn" },
      { kind: "say", at: 3.4, actor: "founders", text: "no replies", tone: "bad" },
      { kind: "verdict", at: 4.2, text: "A like group brings no founders", tone: "bad" },
    ],
    loop: 8,
  },
};
