import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 24.2 beat 1 (One sorted list cannot cut a map)
export const sysdesignM24ScanAllRows: SceneSpec = {
  kind: "scene",
  title: "Asking a table for drivers near me",
  purpose: "The rider asks for drivers within 1 km. The database has one row per driver and an index sorted by one number, so it reads far more rows than it needs.",
  limits: "A real database can combine two numbers in a spatial index. This picture shows the plain case, a table with a normal index, which is what a first design usually starts with.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      {
        id: "rider",
        label: "Rider",
        kind: "phone",
        sub: "near me?",
        x: 70,
        y: 100
      },
      {
        id: "safar",
        label: "Safar",
        kind: "server",
        sub: "ride service",
        x: 350,
        y: 100
      },
      {
        id: "table",
        label: "Driver table",
        kind: "database",
        sub: "1M rows",
        x: 350,
        y: 230
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 0.9,
        from: "rider",
        to: "safar",
        label: "< 1 km?"
      },
      {
        kind: "fly",
        at: 1.4,
        dur: 1,
        from: "safar",
        to: "table",
        label: "lat and lon"
      },
      {
        kind: "say",
        at: 2.4,
        actor: "table",
        text: "reads a strip",
        tone: "warn"
      },
      {
        kind: "mark",
        at: 2.4,
        actor: "table",
        tone: "warn"
      },
      {
        kind: "say",
        at: 3.6,
        actor: "table",
        text: "far too many",
        tone: "bad"
      },
      {
        kind: "say",
        at: 4.2,
        actor: "safar",
        text: "waiting",
        tone: "bad"
      },
      {
        kind: "verdict",
        at: 4.4,
        text: "One sorted list cannot cut a map",
        tone: "bad"
      }
    ],
    loop: 7.5
  }
};
