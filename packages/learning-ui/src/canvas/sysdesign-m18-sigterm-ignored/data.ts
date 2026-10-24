import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.2 beat 5 (The signal nobody answers).
export const sysdesignM18SigtermIgnored: SceneSpec = {
  kind: "scene",
  title: "A Node service that ignores SIGTERM is killed after the wait",
  purpose: "docker stop sends SIGTERM to process 1. A Node service with no handler, running as process 1, ignores it. Docker waits, then sends SIGKILL.",
  limits: "The wait in the picture is docker stop -t 10. The default wait depends on your Docker version (the Kubernetes default is 30 seconds). On Linux the kernel ignores a signal sent to process 1 unless the program installed a handler for it; the picture time is compressed.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "docker", label: "Docker", kind: "server", sub: "stop -t 10", x: 60, y: 100 },
      { id: "app", label: "node", kind: "server", sub: "PID 1", x: 360, y: 100 },
    ],
    strip: { y: 296, from: 0, to: 10, unit: " s", caption: "seconds after docker stop -t 10", every: 2 },
    events: [
      { kind: "tag", at: 0.3, row: 0, value: 0, label: "SIGTERM", tone: "accent" },
      { kind: "fly", at: 0.5, dur: 0.9, from: "docker", to: "app", label: "SIGTERM" },
      { kind: "say", at: 1.4, actor: "app", text: "ignores it", tone: "warn" },
      { kind: "mark", at: 1.4, actor: "app", tone: "warn" },
      { kind: "line", at: 2, value: 10, label: "wait ends" },
      { kind: "say", at: 2.4, actor: "docker", text: "waiting...", tone: "warn" },
      { kind: "fly", at: 3.6, dur: 0.7, from: "docker", to: "app", label: "SIGKILL", tone: "bad" },
      { kind: "tag", at: 4.3, row: 1, value: 10, label: "SIGKILL", tone: "bad" },
      { kind: "say", at: 4.3, actor: "app", text: "killed", tone: "bad" },
      { kind: "verdict", at: 4.6, text: "SIGTERM ignored: killed after 10 s", tone: "bad" },
    ],
    loop: 7.6,
  },
};
