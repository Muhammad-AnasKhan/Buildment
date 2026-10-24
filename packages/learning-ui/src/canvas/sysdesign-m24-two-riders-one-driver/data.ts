import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 24.4 beat 3 (Two riders, one driver)
export const sysdesignM24TwoRidersOneDriver: SceneSpec = {
  kind: "scene",
  title: "Two searches both pick the same driver",
  purpose: "Two riders ask in the same second. Two searches run side by side. Both see Driver D as free and both send D an offer.",
  limits: "This is a race between two searches, like the two buyers of the last ticket in chapter 7.1. It is rare for one pair of riders, but with 600 requests a second it happens all the time.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      {
        id: "sa",
        label: "Search A",
        kind: "server",
        sub: "sees D free",
        x: 70,
        y: 100
      },
      {
        id: "sb",
        label: "Search B",
        kind: "server",
        sub: "sees D free",
        x: 70,
        y: 230
      },
      {
        id: "d",
        label: "Driver D",
        kind: "phone",
        sub: "free",
        x: 350,
        y: 165
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.5,
        dur: 1.2,
        from: "sa",
        to: "d",
        label: "offer for A"
      },
      {
        kind: "fly",
        at: 0.5,
        dur: 1.2,
        from: "sb",
        to: "d",
        label: "offer for B"
      },
      {
        kind: "say",
        at: 1.8,
        actor: "d",
        text: "two offers!",
        tone: "bad"
      },
      {
        kind: "mark",
        at: 1.8,
        actor: "d",
        tone: "bad"
      },
      {
        kind: "say",
        at: 2.6,
        actor: "sa",
        text: "told: coming",
        tone: "warn"
      },
      {
        kind: "say",
        at: 2.6,
        actor: "sb",
        text: "told: coming",
        tone: "warn"
      },
      {
        kind: "verdict",
        at: 2.8,
        text: "Two rides, one driver",
        tone: "bad"
      }
    ],
    loop: 6
  }
};
