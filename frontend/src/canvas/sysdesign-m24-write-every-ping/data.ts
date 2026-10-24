import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 24.3 beat 1 (A ping every 4 seconds, a million drivers)
export const sysdesignM24WriteEveryPing: SceneSpec = {
  kind: "scene",
  title: "Every ping becomes a disk write",
  purpose: "A driver's phone reports its place every 4 seconds. If the gateway writes each report into a database table, 1 million drivers make 250,000 writes a second.",
  limits: "One driver is drawn, but the rate is for all of them. A database node is planned at 2,500 writes a second, the same course number as chapter 20.2.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      {
        id: "driver",
        label: "Driver",
        kind: "phone",
        sub: "pings every 4 s",
        x: 70,
        y: 100
      },
      {
        id: "gateway",
        label: "Gateway",
        kind: "router",
        sub: "takes pings",
        x: 350,
        y: 100
      },
      {
        id: "db",
        label: "Database",
        kind: "database",
        sub: "one row each",
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
        to: "gateway",
        label: "ping"
      },
      {
        kind: "fly",
        at: 1.3,
        dur: 0.9,
        from: "gateway",
        to: "db",
        label: "write"
      },
      {
        kind: "say",
        at: 2.2,
        actor: "db",
        text: "write 1",
        tone: "accent"
      },
      {
        kind: "fly",
        at: 2.6,
        dur: 0.9,
        from: "driver",
        to: "gateway",
        label: "ping"
      },
      {
        kind: "fly",
        at: 3.5,
        dur: 0.9,
        from: "gateway",
        to: "db",
        label: "write"
      },
      {
        kind: "say",
        at: 4.4,
        actor: "db",
        text: "write 2",
        tone: "accent"
      },
      {
        kind: "say",
        at: 4.9,
        actor: "db",
        text: "250,000 a sec",
        tone: "bad"
      },
      {
        kind: "mark",
        at: 4.9,
        actor: "db",
        tone: "bad"
      },
      {
        kind: "verdict",
        at: 5,
        text: "One disk write per ping adds up",
        tone: "bad"
      }
    ],
    loop: 8
  }
};
