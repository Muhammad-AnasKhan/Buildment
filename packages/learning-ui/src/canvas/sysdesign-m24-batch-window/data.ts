import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 24.4 beat 6 (Wait 2 seconds, match together)
export const sysdesignM24BatchWindow: SceneSpec = {
  kind: "scene",
  title: "Collect requests for 2 seconds, then match",
  purpose: "Rider A asks at 0.3 s and rider B at 1.2 s. Dispatch holds both until the 2 second window ends, then matches them together instead of one by one.",
  limits: "A 2 second window is a course choice. The rider who asked first waits up to 2 seconds longer. Matching is easy for two riders, but a window with thousands of riders needs a proper assignment method.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      {
        id: "riders",
        label: "Riders",
        kind: "phone",
        sub: "A, then B",
        x: 70,
        y: 100
      },
      {
        id: "disp",
        label: "Dispatch",
        kind: "server",
        sub: "collecting",
        x: 350,
        y: 100
      }
    ],
    strip: {
      y: 300,
      from: 0,
      to: 4,
      unit: "s",
      caption: "seconds after A asks",
      every: 1
    },
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 0.8,
        from: "riders",
        to: "disp",
        label: "A asks"
      },
      {
        kind: "tag",
        at: 0.3,
        row: 0,
        value: 0.3,
        label: "A asks"
      },
      {
        kind: "fly",
        at: 1.2,
        dur: 0.8,
        from: "riders",
        to: "disp",
        label: "B asks"
      },
      {
        kind: "tag",
        at: 1.2,
        row: 1,
        value: 1.2,
        label: "B asks"
      },
      {
        kind: "line",
        at: 2,
        value: 2,
        label: "window ends"
      },
      {
        kind: "say",
        at: 2.1,
        actor: "disp",
        text: "matches both",
        tone: "good"
      },
      {
        kind: "mark",
        at: 2.1,
        actor: "disp",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 2.4,
        text: "Wait 2 s, match both together",
        tone: "good"
      }
    ],
    loop: 6
  }
};
