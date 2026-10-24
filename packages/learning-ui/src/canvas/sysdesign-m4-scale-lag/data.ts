import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 4.6: scaling lags a spike. Load doubles at 0 s, the autoscaler sees it at
// its next check (15 s), and new servers take 90 s to boot, so help arrives at
// 105 s.
export const sysdesignM4ScaleLag: SceneSpec = {
  kind: "scene",
  title: "Help arrives 105 seconds after the spike",
  purpose: "Traffic doubles at once. The autoscaler only notices at its next check, and new servers need time to boot and warm up, so for almost two minutes the old servers carry double load.",
  limits: "The 15-second check is the Kubernetes default; the 90-second boot is a made-up round number (real times depend on the image, the machine and the app's warm-up). CPU cannot read above 100%, so the first check under-counts the need; the picture adds 3, and a later check would add more.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "auto", label: "Autoscaler", kind: "worker", sub: "checks each 15s", x: 62, y: 110 },
      { id: "fleet", label: "Servers", kind: "server", sub: "4 at 60%", x: 358, y: 110 },
    ],
    strip: { y: 262, from: 0, to: 120, unit: "s", caption: "seconds after the spike", every: 30 },
    events: [
      { kind: "tag", at: 0.2, row: 0, value: 0, label: "spike at 0 s", tone: "bad" },
      { kind: "say", at: 0.2, actor: "fleet", text: "overloaded", tone: "bad" },
      { kind: "mark", at: 0.2, actor: "fleet", tone: "bad" },
      { kind: "fly", at: 1, dur: 0.7, from: "fleet", to: "auto", label: "CPU 100%" },
      { kind: "tag", at: 1, row: 1, value: 15, label: "seen at 15 s", tone: "warn" },
      { kind: "fly", at: 1.9, dur: 0.7, from: "auto", to: "fleet", label: "start 3" },
      { kind: "say", at: 2.6, actor: "fleet", text: "3 booting", tone: "warn" },
      { kind: "wait", at: 2.6, dur: 2.6, actor: "auto", label: "boot {n} s", doneLabel: "booted: 90 s", total: 90 },
      { kind: "tag", at: 5.2, row: 0, value: 105, label: "ready at 105 s", tone: "good" },
      { kind: "say", at: 5.2, actor: "fleet", text: "7 servers", tone: "good" },
      { kind: "mark", at: 5.2, actor: "fleet", tone: "good" },
      { kind: "verdict", at: 5.4, text: "Help came 105 s after the spike", tone: "warn" },
    ],
    loop: 8.4,
  },
};
