import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 4.6: flapping. A short dip makes an autoscaler with no stabilisation window
// remove 2 servers; load comes back and it must add them again, with a boot
// gap.
export const sysdesignM4Flapping: SceneSpec = {
  kind: "scene",
  title: "Removed in a dip, missed a minute later",
  purpose: "Load dips for half a minute. Without a waiting window, the autoscaler removes two servers at once. The load comes back, and the new servers need 90 seconds to boot.",
  limits: "The dip and the boot time are made-up round numbers. Real autoscalers wait before scaling in (Kubernetes uses a stabilisation window for scale-down) exactly to avoid this.",
  scene: {
    width: 420,
    height: 200,
    actors: [
      { id: "auto", label: "Autoscaler", kind: "worker", sub: "no window", x: 62, y: 120 },
      { id: "fleet", label: "Servers", kind: "server", sub: "6 servers", x: 358, y: 120 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "fleet", to: "auto", label: "dip: 40%" },
      { kind: "say", at: 0.9, actor: "auto", text: "6x40/60 = 4", tone: "warn" },
      { kind: "fly", at: 1.2, dur: 0.7, from: "auto", to: "fleet", label: "stop 2" },
      { kind: "say", at: 1.9, actor: "fleet", text: "4 servers", tone: "warn" },
      { kind: "fly", at: 2.6, dur: 0.7, from: "fleet", to: "auto", label: "back: 90%" },
      { kind: "say", at: 3.3, actor: "auto", text: "4x90/60 = 6", tone: "warn" },
      { kind: "fly", at: 3.6, dur: 0.7, from: "auto", to: "fleet", label: "start 2" },
      { kind: "say", at: 4.3, actor: "fleet", text: "slow for 90 s", tone: "bad" },
      { kind: "mark", at: 4.3, actor: "fleet", tone: "bad" },
      { kind: "verdict", at: 4.5, text: "No window: removed, then missed", tone: "bad" },
    ],
    loop: 7.5,
  },
};
