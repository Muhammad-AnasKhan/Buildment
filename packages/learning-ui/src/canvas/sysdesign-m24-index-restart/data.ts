import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 24.3 beat 7 (Restart empty, refill in seconds)
export const sysdesignM24IndexRestart: SceneSpec = {
  kind: "scene",
  title: "The map restarts empty and refills itself",
  purpose: "A map node restarts and holds nothing. Every driver pings again within 4 seconds, so the map is full again without any backup.",
  limits: "Riders on this node see an empty map for a few seconds. Drivers who are stopped may ping less often, so the last of them take longer to return.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      {
        id: "drivers",
        label: "Drivers",
        kind: "phone",
        sub: "ping every 4 s",
        x: 70,
        y: 100
      },
      {
        id: "map",
        label: "Driver map",
        kind: "cache",
        sub: "restarted",
        x: 350,
        y: 100
      },
      {
        id: "rider",
        label: "Rider",
        kind: "phone",
        sub: "sees no cars",
        x: 350,
        y: 230
      }
    ],
    events: [
      {
        kind: "say",
        at: 0.3,
        actor: "map",
        text: "empty",
        tone: "bad"
      },
      {
        kind: "say",
        at: 0.3,
        actor: "rider",
        text: "sees no cars",
        tone: "bad"
      },
      {
        kind: "fly",
        at: 1,
        dur: 0.9,
        from: "drivers",
        to: "map",
        label: "pings"
      },
      {
        kind: "say",
        at: 1.9,
        actor: "map",
        text: "refilling",
        tone: "accent"
      },
      {
        kind: "fly",
        at: 2.6,
        dur: 0.9,
        from: "drivers",
        to: "map",
        label: "pings"
      },
      {
        kind: "say",
        at: 3.5,
        actor: "map",
        text: "almost full",
        tone: "accent"
      },
      {
        kind: "say",
        at: 4.5,
        actor: "map",
        text: "full again",
        tone: "good"
      },
      {
        kind: "say",
        at: 4.6,
        actor: "rider",
        text: "sees all cars",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 4.7,
        text: "No backup needed: pings refill it",
        tone: "good"
      }
    ],
    loop: 8
  }
};
