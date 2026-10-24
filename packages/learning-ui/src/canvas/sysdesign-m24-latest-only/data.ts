import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 24.3 beat 2 (Only the latest place matters)
export const sysdesignM24LatestOnly: SceneSpec = {
  kind: "scene",
  title: "The map keeps the latest, the log keeps all",
  purpose: "Each new ping replaces the driver's place on the map. The old place is useless for a search, so it goes to a cheap history log instead.",
  limits: "The log is drawn as one box. In a real design it is a stream (chapter 15.3) read by other services, such as trip receipts.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      {
        id: "driver",
        label: "Driver",
        kind: "phone",
        sub: "moves along",
        x: 70,
        y: 100
      },
      {
        id: "map",
        label: "Driver map",
        kind: "cache",
        sub: "latest only",
        x: 350,
        y: 100
      },
      {
        id: "log",
        label: "History log",
        kind: "queue",
        sub: "keeps all",
        x: 350,
        y: 230
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 0.9,
        from: "driver",
        to: "map",
        label: "place A"
      },
      {
        kind: "say",
        at: 1.2,
        actor: "map",
        text: "holds A",
        tone: "accent"
      },
      {
        kind: "fly",
        at: 1.5,
        dur: 0.9,
        from: "map",
        to: "log",
        label: "A"
      },
      {
        kind: "say",
        at: 2.4,
        actor: "log",
        text: "has A",
        tone: "accent"
      },
      {
        kind: "fly",
        at: 3,
        dur: 0.9,
        from: "driver",
        to: "map",
        label: "place B"
      },
      {
        kind: "say",
        at: 3.9,
        actor: "map",
        text: "holds B only",
        tone: "good"
      },
      {
        kind: "fly",
        at: 4.2,
        dur: 0.9,
        from: "map",
        to: "log",
        label: "B"
      },
      {
        kind: "say",
        at: 5.1,
        actor: "log",
        text: "has A and B",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 5.2,
        text: "Map keeps latest, log keeps all",
        tone: "good"
      }
    ],
    loop: 8.5
  }
};
