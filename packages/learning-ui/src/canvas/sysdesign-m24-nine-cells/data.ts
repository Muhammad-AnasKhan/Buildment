import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 24.2 beat 4 (Look in nine boxes)
export const sysdesignM24NineCells: SceneSpec = {
  kind: "scene",
  title: "Search your own box and the eight around it",
  purpose: "The rider's box is stq4vy. The driver is 30 m away but in the next box. The search reads the rider's box and all eight neighbours, so the driver is found.",
  limits: "Nine boxes are enough only when each box is at least as wide and tall as the search distance. Chapter 24.2 shows what to do when it is not.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      {
        id: "rider",
        label: "Rider",
        kind: "phone",
        sub: "box stq4vy",
        x: 70,
        y: 100
      },
      {
        id: "map",
        label: "Driver map",
        kind: "cache",
        sub: "reads 9 boxes",
        x: 350,
        y: 100
      },
      {
        id: "driver",
        label: "Driver",
        kind: "phone",
        sub: "box stq4yn",
        x: 350,
        y: 230
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 1,
        from: "rider",
        to: "map",
        label: "my box + 8"
      },
      {
        kind: "say",
        at: 1.3,
        actor: "map",
        text: "reads 9 boxes",
        tone: "accent"
      },
      {
        kind: "mark",
        at: 1.3,
        actor: "map",
        tone: "accent"
      },
      {
        kind: "mark",
        at: 2.4,
        actor: "driver",
        tone: "good"
      },
      {
        kind: "say",
        at: 2.4,
        actor: "driver",
        text: "next box east",
        tone: "good"
      },
      {
        kind: "fly",
        at: 2.7,
        dur: 1,
        from: "map",
        to: "rider",
        label: "driver 30 m",
        tone: "good"
      },
      {
        kind: "say",
        at: 3.7,
        actor: "rider",
        text: "found one",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 3.8,
        text: "Nine boxes catch the near driver",
        tone: "good"
      }
    ],
    loop: 7
  }
};
