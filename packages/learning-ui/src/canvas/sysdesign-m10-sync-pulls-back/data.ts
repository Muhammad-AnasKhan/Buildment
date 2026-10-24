import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 10.2 beat 2: a sync asks a time server and corrects the clock, but only
// to within a few milliseconds, not to zero.
export const sysdesignM10SyncPullsBack: SceneSpec = {
  kind: "scene",
  title: "A sync pulls the clock back, but not to zero",
  purpose: "Server A asks a time server for the time; the correction cuts a 180 ms error to a few milliseconds.",
  limits: "The 180 ms start and the 2 ms end are illustrative. How close a sync gets depends on the network: within 1 ms on a quiet local network, and more on wider ones (S64, S52). Real NTP also eases the clock toward the right time instead of jumping.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "a", label: "Server A", kind: "server", sub: "+180 ms off", x: 70, y: 100 },
      { id: "ntp", label: "NTP server", kind: "clock", sub: "knows the time", x: 350, y: 100 },
    ],
    strip: { y: 300, from: -200, to: 200, unit: "ms", caption: "clock error", every: 100 },
    events: [
      { kind: "tag", at: 0.2, row: 0, value: 180, label: "before +180 ms", tone: "bad" },
      { kind: "fly", at: 0.8, dur: 1.2, from: "a", to: "ntp", label: "what time?" },
      { kind: "say", at: 2, actor: "ntp", text: "12:00:00.000", tone: "good" },
      { kind: "fly", at: 2.4, dur: 1.2, from: "ntp", to: "a", label: "time + trip" },
      { kind: "say", at: 3.6, actor: "a", text: "adjusting", tone: "warn" },
      { kind: "say", at: 4.4, actor: "a", text: "+2 ms off", tone: "good" },
      { kind: "tag", at: 4.4, row: 1, value: 2, label: "after +2 ms", tone: "good" },
      { kind: "verdict", at: 4.8, text: "180 ms error drops to a few ms", tone: "good" },
    ],
    loop: 8.2,
  },
};
