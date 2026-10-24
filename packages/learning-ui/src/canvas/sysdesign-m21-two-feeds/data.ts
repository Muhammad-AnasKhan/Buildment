import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 21.1 beat 1 (A feed is a different list for each person)
export const sysdesignM21TwoFeeds: SceneSpec = {
  kind: "scene",
  title: "One app, a different feed for each person",
  purpose: "Salma and Omar both open Hikaya. The same app builds two different lists, because each of them follows different accounts.",
  limits: "Hikaya is a made-up app. The picture shows two readers only. A real feed also mixes in ranking, which chapter 21.4 covers.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "salma", label: "Salma", kind: "phone", sub: "opens Hikaya", x: 70, y: 85 },
      { id: "omar", label: "Omar", kind: "phone", sub: "opens Hikaya", x: 70, y: 235 },
      { id: "app", label: "Hikaya", kind: "server", sub: "builds a feed", x: 350, y: 160 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "salma", to: "app", label: "open feed" },
      { kind: "fly", at: 0.6, dur: 0.8, from: "omar", to: "app", label: "open feed" },
      { kind: "say", at: 1.5, actor: "app", text: "who they follow", tone: "accent" },
      { kind: "fly", at: 2.2, dur: 0.9, from: "app", to: "salma", label: "Dina, News", tone: "good" },
      { kind: "fly", at: 2.6, dur: 0.9, from: "app", to: "omar", label: "Karim, Bakery", tone: "good" },
      { kind: "say", at: 3.1, actor: "salma", text: "sees Dina", tone: "good" },
      { kind: "say", at: 3.5, actor: "omar", text: "sees Karim", tone: "good" },
      { kind: "mark", at: 3.6, actor: "app", tone: "good" },
      { kind: "verdict", at: 3.8, text: "Same app, a different feed each", tone: "good" },
    ],
    loop: 7,
  },
};
