import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 24.4 beat 4 (Claim the driver first)
export const sysdesignM24ClaimFirst: SceneSpec = {
  kind: "scene",
  title: "Claim the driver before offering",
  purpose: "Each search first tries to claim Driver D: set D from free to held, only if D is still free. One claim wins. The other search is told it is taken and tries another driver.",
  limits: "The claim lasts 10 seconds. If the dispatcher crashes, the claim expires by itself, like a lease (chapter 12.4), and D becomes free again.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      {
        id: "sa",
        label: "Search A",
        kind: "server",
        sub: "wants D",
        x: 70,
        y: 100
      },
      {
        id: "sb",
        label: "Search B",
        kind: "server",
        sub: "wants D",
        x: 70,
        y: 230
      },
      {
        id: "d",
        label: "Driver D",
        kind: "database",
        sub: "free",
        x: 350,
        y: 165
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.4,
        dur: 1,
        from: "sa",
        to: "d",
        label: "claim D"
      },
      {
        kind: "fly",
        at: 0.7,
        dur: 1,
        from: "sb",
        to: "d",
        label: "claim D"
      },
      {
        kind: "say",
        at: 1.8,
        actor: "d",
        text: "held by A",
        tone: "accent"
      },
      {
        kind: "fly",
        at: 2.1,
        dur: 1,
        from: "d",
        to: "sa",
        label: "yours",
        tone: "good"
      },
      {
        kind: "fly",
        at: 2.2,
        dur: 1,
        from: "d",
        to: "sb",
        label: "taken",
        tone: "bad"
      },
      {
        kind: "say",
        at: 3.3,
        actor: "sa",
        text: "sends offer",
        tone: "good"
      },
      {
        kind: "say",
        at: 3.3,
        actor: "sb",
        text: "next driver",
        tone: "warn"
      },
      {
        kind: "verdict",
        at: 3.5,
        text: "One claim wins, the other moves on",
        tone: "good"
      }
    ],
    loop: 6.5
  }
};
