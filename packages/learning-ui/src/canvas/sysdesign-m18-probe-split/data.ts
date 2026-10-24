import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.4 beat 4 (Not ready is not the same as stuck).
export const sysdesignM18ProbeSplit: SceneSpec = {
  kind: "scene",
  title: "A failed readiness probe pauses traffic; a failed liveness probe restarts",
  purpose: "Pod B fails its readiness probe, so the Service stops sending it requests but leaves it alone. Later it fails its liveness probe three times and the kubelet restarts it.",
  limits: "The kubelet is the agent on each machine that runs the probes. Probe timing is set per pod: in the challenge the readiness probe runs every 2 seconds and the liveness probe every 5 seconds with 3 failures allowed. The picture compresses the time.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "kubelet", label: "Kubelet", kind: "worker", sub: "runs probes", x: 60, y: 145 },
      { id: "svc", label: "Service", kind: "router", sub: "sends to A, B", x: 210, y: 145 },
      { id: "a", label: "Pod A", kind: "server", sub: "ready", x: 360, y: 100 },
      { id: "b", label: "Pod B", kind: "server", sub: "ready", x: 360, y: 190 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "kubelet", to: "b", label: "GET /ready" },
      { kind: "fly", at: 1, dur: 0.7, from: "b", to: "kubelet", label: "503", tone: "bad" },
      { kind: "say", at: 1.7, actor: "b", text: "not ready", tone: "warn" },
      { kind: "say", at: 1.9, actor: "svc", text: "sends to A", tone: "good" },
      { kind: "fly", at: 3, dur: 0.7, from: "kubelet", to: "b", label: "GET /health" },
      { kind: "say", at: 3.8, actor: "b", text: "stuck", tone: "bad" },
      { kind: "say", at: 4.2, actor: "kubelet", text: "3 fails", tone: "bad" },
      { kind: "say", at: 4.6, actor: "b", text: "restarted", tone: "accent" },
      { kind: "say", at: 5.6, actor: "b", text: "ready", tone: "good" },
      { kind: "say", at: 5.6, actor: "svc", text: "sends to A, B", tone: "good" },
      { kind: "verdict", at: 5.8, text: "Not ready: no traffic. Stuck: restart", tone: "good" },
    ],
    loop: 8.4,
  },
};
