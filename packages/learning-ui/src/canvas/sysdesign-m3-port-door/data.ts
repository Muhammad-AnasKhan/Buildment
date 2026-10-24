import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.6 beat 2: the operating system hands a new connection to the process
// that listens on its port. The web app listens on 443 and gets a new socket
// (a file descriptor). Nothing listens on 8080, so that connection is refused.
export const sysdesignM3PortDoor: SceneSpec = {
  kind: "scene",
  title: "The port number picks the process",
  purpose: "Two connections reach the same machine. The kernel gives the one for port 443 to the web app, and refuses the one for port 8080, where nothing listens.",
  limits: "One machine, one listening process. The file descriptor number 12 is an example.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "client", kind: "phone", label: "Client", sub: "connecting", x: 60, y: 165 },
      { id: "kernel", kind: "worker", label: "Kernel", sub: "checks port", x: 210, y: 165 },
      { id: "web", kind: "server", label: "Web app", sub: "listens on 443", x: 360, y: 90 },
      { id: "port", kind: "note", label: "Port 8080", sub: "no listener", x: 360, y: 240 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.6, from: "client", to: "kernel", label: "to port 443" },
      { kind: "say", at: 0.8, actor: "kernel", text: "443: web app" },
      { kind: "fly", at: 0.9, dur: 0.6, from: "kernel", to: "web", label: "new socket" },
      { kind: "say", at: 1.5, actor: "web", text: "fd 12 opened", tone: "good" },
      { kind: "say", at: 1.5, actor: "client", text: "connected", tone: "good" },
      { kind: "fly", at: 2.3, dur: 0.6, from: "client", to: "kernel", label: "to port 8080" },
      { kind: "say", at: 2.9, actor: "kernel", text: "8080: nobody", tone: "bad" },
      { kind: "mark", at: 2.9, actor: "port", tone: "bad" },
      { kind: "fly", at: 3.0, dur: 0.6, from: "kernel", to: "client", label: "refused", tone: "bad" },
      { kind: "say", at: 3.6, actor: "client", text: "refused", tone: "bad" },
      { kind: "verdict", at: 3.8, text: "The port number picks the process", tone: "accent" },
    ],
    loop: 7,
  },
};
