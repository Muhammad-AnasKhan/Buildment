import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.3 beat 5 (A health check reports, it does not restart).
export const sysdesignM18DockerHealth: SceneSpec = {
  kind: "scene",
  title: "Docker marks a stuck container unhealthy, and leaves it running",
  purpose: "The container's health check calls /health every 10 seconds. After three failures in a row the status becomes unhealthy. Plain Docker does not restart it.",
  limits: "Measured with HEALTHCHECK --interval=10s --retries=3. The status changed about 30 seconds after the service got stuck, and the restart count stayed at 0. Docker Swarm and Kubernetes act on health, plain docker run does not.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "docker", label: "Docker", kind: "server", sub: "checks /health", x: 60, y: 100 },
      { id: "app", label: "Service", kind: "server", sub: "running", x: 360, y: 100 },
    ],
    strip: { y: 296, from: 0, to: 40, unit: " s", caption: "seconds since the service got stuck", every: 10 },
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "docker", to: "app", label: "check" },
      { kind: "fly", at: 1, dur: 0.6, from: "app", to: "docker", label: "200", tone: "good" },
      { kind: "say", at: 1.9, actor: "app", text: "stuck", tone: "warn" },
      { kind: "tag", at: 2.2, row: 0, value: 10, label: "fail 1", tone: "warn" },
      { kind: "tag", at: 3, row: 1, value: 20, label: "fail 2", tone: "warn" },
      { kind: "tag", at: 3.8, row: 0, value: 30, label: "fail 3", tone: "bad" },
      { kind: "say", at: 4, actor: "docker", text: "unhealthy", tone: "bad" },
      { kind: "say", at: 4.2, actor: "app", text: "still running", tone: "warn" },
      { kind: "verdict", at: 4.6, text: "Unhealthy, but nothing restarts it", tone: "warn" },
    ],
    loop: 7.6,
  },
};
