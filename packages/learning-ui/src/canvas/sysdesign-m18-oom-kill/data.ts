import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.2 beat 3 (A memory limit kills).
export const sysdesignM18OomKill: SceneSpec = {
  kind: "scene",
  title: "A container that goes over its memory limit is killed",
  purpose: "The service asks for 20 MB more again and again. At 100 MB the kernel kills the process, and the container exits with code 137.",
  limits: "Measured on Docker Desktop with --memory=100m and --memory-swap=100m. Without a swap limit a container may use disk swap first. Kubernetes memory limits work the same way, and the pod shows OOMKilled.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "client", label: "Client", kind: "user", x: 60, y: 100 },
      { id: "app", label: "Container", kind: "server", sub: "limit 100 MB", x: 360, y: 100 },
      { id: "kernel", label: "Kernel", kind: "router", sub: "enforces limit", x: 210, y: 190 },
    ],
    strip: { y: 296, from: 0, to: 140, unit: " MB", caption: "memory in use", every: 20 },
    events: [
      { kind: "line", at: 0.2, value: 100, label: "limit 100 MB" },
      { kind: "fly", at: 0.4, dur: 0.7, from: "client", to: "app", label: "+20 MB" },
      { kind: "tag", at: 1.1, row: 0, value: 20, label: "20 MB", tone: "good" },
      { kind: "fly", at: 1.3, dur: 0.7, from: "client", to: "app", label: "+20 MB" },
      { kind: "tag", at: 2, row: 1, value: 40, label: "40 MB", tone: "good" },
      { kind: "fly", at: 2.2, dur: 0.7, from: "client", to: "app", label: "+20 MB" },
      { kind: "tag", at: 2.9, row: 0, value: 60, label: "60 MB", tone: "good" },
      { kind: "fly", at: 3.1, dur: 0.7, from: "client", to: "app", label: "+20 MB" },
      { kind: "tag", at: 3.8, row: 1, value: 80, label: "80 MB", tone: "warn" },
      { kind: "fly", at: 4, dur: 0.7, from: "client", to: "app", label: "+20 MB" },
      { kind: "tag", at: 4.8, row: 0, value: 100, label: "100+ MB", tone: "bad" },
      { kind: "say", at: 4.9, actor: "kernel", text: "OOM kill", tone: "bad" },
      { kind: "mark", at: 4.9, actor: "kernel", tone: "bad" },
      { kind: "say", at: 5.4, actor: "app", text: "exit 137", tone: "bad" },
      { kind: "verdict", at: 5.7, text: "Over the limit: process killed", tone: "bad" },
    ],
    loop: 8.6,
  },
};
