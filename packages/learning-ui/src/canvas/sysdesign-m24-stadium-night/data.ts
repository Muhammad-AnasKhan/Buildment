import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 24.3 beat 6 (The stadium empties)
export const sysdesignM24StadiumNight: SceneSpec = {
  kind: "scene",
  title: "A stadium at night is one very busy box",
  purpose: "After the match, 20,000 fans open the app in the same box. One shard owns that box and gets 4,000 searches a second. A copy of the box's map, 2 seconds old, answers them instead.",
  limits: "The copy is only for the map screen. The match itself must read live data. The numbers are illustrative: one shard here is not broken, it carries 75 times the work of a quiet box and cannot hand any of it to another shard.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      {
        id: "fans",
        label: "Fans",
        kind: "phone",
        sub: "20,000 phones",
        x: 70,
        y: 100
      },
      {
        id: "busy",
        label: "Stadium box",
        kind: "cache",
        sub: "3,000 drivers",
        x: 350,
        y: 100
      },
      {
        id: "copy",
        label: "Map copy",
        kind: "cdn",
        sub: "2 s old",
        x: 70,
        y: 230
      },
      {
        id: "quiet",
        label: "Quiet box",
        kind: "cache",
        sub: "40 drivers",
        x: 350,
        y: 230
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 1,
        from: "fans",
        to: "busy",
        label: "4,000 / s"
      },
      {
        kind: "say",
        at: 1.3,
        actor: "busy",
        text: "75x a quiet box",
        tone: "warn"
      },
      {
        kind: "mark",
        at: 1.3,
        actor: "busy",
        tone: "warn"
      },
      {
        kind: "say",
        at: 2.6,
        actor: "copy",
        text: "added",
        tone: "accent"
      },
      {
        kind: "fly",
        at: 3,
        dur: 1,
        from: "fans",
        to: "copy",
        label: "4,000 / s"
      },
      {
        kind: "say",
        at: 4,
        actor: "copy",
        text: "answers all",
        tone: "good"
      },
      {
        kind: "fly",
        at: 4.3,
        dur: 1.1,
        from: "copy",
        to: "busy",
        label: "1 per 2 s"
      },
      {
        kind: "say",
        at: 5.4,
        actor: "busy",
        text: "calm again",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 5.5,
        text: "Cache the busy box's map for 2 s",
        tone: "good"
      }
    ],
    loop: 9
  }
};
