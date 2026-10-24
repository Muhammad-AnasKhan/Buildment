import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Beat 3 of 1.2: Hana's team (fictional) has 2 engineers and 6 weeks. Each
// design idea is checked against those limits before anyone draws boxes.
export const sysdesignM1Constraints: SceneSpec = {
  kind: "scene",
  title: "Constraints rule out designs before you draw",
  purpose: "Three ideas meet the team's limits of 2 engineers and 6 weeks; two are rejected and one fits.",
  limits: "A fictional team. Real constraints also include money, the hardware or cloud you already have, laws about where data may live, and the skills on the team.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "team", label: "Team", kind: "user", sub: "has 3 ideas", x: 70, y: 110 },
      { id: "limits", label: "Limits", kind: "router", sub: "2 people, 6 wks", x: 300, y: 110 },
      { id: "plan", label: "Plan", kind: "server", sub: "empty", x: 300, y: 228 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 0.8, from: "team", to: "limits", label: "12 services" },
      { kind: "say", at: 0.8, actor: "limits", text: "2 people: no", tone: "bad" },
      { kind: "fly", at: 0.9, dur: 0.7, from: "limits", to: "team", label: "no", tone: "bad" },

      { kind: "fly", at: 2.0, dur: 0.8, from: "team", to: "limits", label: "own search engine" },
      { kind: "say", at: 2.8, actor: "limits", text: "6 weeks: no", tone: "bad" },
      { kind: "fly", at: 2.9, dur: 0.7, from: "limits", to: "team", label: "no", tone: "bad" },

      { kind: "fly", at: 4.0, dur: 0.8, from: "team", to: "limits", label: "1 app + Postgres" },
      { kind: "say", at: 4.8, actor: "limits", text: "fits", tone: "good" },
      { kind: "fly", at: 4.9, dur: 0.6, from: "limits", to: "plan", label: "go", tone: "good" },
      { kind: "say", at: 5.5, actor: "plan", text: "app + Postgres", tone: "good" },
      { kind: "say", at: 5.5, actor: "team", text: "1 idea left" },
      { kind: "verdict", at: 5.8, text: "Constraints remove options early", tone: "accent" },
    ],
    loop: 8.8,
  },
};
