import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.2 beat 6 (Drain, then exit).
export const sysdesignM18GracefulDrain: SceneSpec = {
  kind: "scene",
  title: "A service with a handler finishes its work, then exits",
  purpose: "Docker sends SIGTERM while a request is in flight. The service stops taking new work, finishes the request, and exits with code 0.",
  limits: "In the challenge the service closes its listener and waits for open requests, with a limit of 8 seconds before it gives up. A real service may also need to close database connections and flush logs.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "users", label: "Users", kind: "user", x: 60, y: 100 },
      { id: "docker", label: "Docker", kind: "server", sub: "docker stop", x: 60, y: 190 },
      { id: "app", label: "Service", kind: "server", sub: "serving", x: 360, y: 145 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "users", to: "app", label: "request" },
      { kind: "say", at: 1.1, actor: "app", text: "working", tone: "accent" },
      { kind: "fly", at: 1.5, dur: 0.8, from: "docker", to: "app", label: "SIGTERM" },
      { kind: "say", at: 2.3, actor: "app", text: "draining", tone: "warn" },
      { kind: "mark", at: 2.3, actor: "app", tone: "warn" },
      { kind: "fly", at: 2.9, dur: 0.9, from: "app", to: "users", label: "answer", tone: "good" },
      { kind: "say", at: 3.9, actor: "app", text: "exit 0", tone: "good" },
      { kind: "verdict", at: 4.2, text: "Request finished, then exit 0", tone: "good" },
    ],
    loop: 7.2,
  },
};
