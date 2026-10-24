import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 24.3 beat 5 (Add to the new box, then drop the old)
export const sysdesignM24CrossCellEdge: SceneSpec = {
  kind: "scene",
  title: "A driver crosses a box edge",
  purpose: "The driver drives from box 12 into box 13. The map adds the driver to box 13 first and only then removes it from box 12, so a search in between still finds the driver.",
  limits: "Two steps are not one atomic step. For a few milliseconds the driver is in both boxes, so a search can see the same driver twice and must remove duplicates.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      {
        id: "driver",
        label: "Driver",
        kind: "phone",
        sub: "in box 12",
        x: 70,
        y: 100
      },
      {
        id: "old",
        label: "Box 12",
        kind: "cache",
        sub: "has the driver",
        x: 350,
        y: 100
      },
      {
        id: "new",
        label: "Box 13",
        kind: "cache",
        sub: "empty",
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
        to: "old",
        label: "ping"
      },
      {
        kind: "say",
        at: 1.5,
        actor: "driver",
        text: "crosses edge",
        tone: "warn"
      },
      {
        kind: "fly",
        at: 2,
        dur: 1,
        from: "driver",
        to: "new",
        label: "ping"
      },
      {
        kind: "say",
        at: 3,
        actor: "new",
        text: "adds driver",
        tone: "good"
      },
      {
        kind: "mark",
        at: 3,
        actor: "new",
        tone: "good"
      },
      {
        kind: "say",
        at: 3.9,
        actor: "old",
        text: "drops driver",
        tone: "accent"
      },
      {
        kind: "say",
        at: 4,
        actor: "driver",
        text: "in box 13",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 4.2,
        text: "Add to new box, then drop old",
        tone: "good"
      }
    ],
    loop: 7.5
  }
};
