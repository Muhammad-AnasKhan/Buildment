import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 4.1: Daftar runs on one big server. It restarts for an update during exam
// week, and every student gets an error.
export const sysdesignM4OneBigServer: SceneSpec = {
  kind: "scene",
  title: "One big server restarts, and everyone is out",
  purpose: "Daftar serves 8,000 students from one big server. When that one server restarts, there is nothing else to answer them.",
  limits: "Made-up round numbers for a fictional app: 8,000 students online, each sending a request every 20 seconds (400 a second), on a server that can do about 800 a second. The restart is a planned security update; a crash or a disk failure looks the same to students. Time is sped up.",
  scene: {
    width: 420,
    height: 200,
    actors: [
      { id: "students", label: "Students", kind: "user", sub: "8,000 online", x: 62, y: 120 },
      { id: "server", label: "Big server", kind: "server", sub: "50% busy", x: 210, y: 120 },
      { id: "db", label: "Database", kind: "database", sub: "notes", x: 358, y: 120 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "students", to: "server", label: "open notes" },
      { kind: "fly", at: 1, dur: 0.6, from: "server", to: "db", label: "query" },
      { kind: "fly", at: 1.6, dur: 0.6, from: "db", to: "server", label: "rows", tone: "good" },
      { kind: "fly", at: 2.2, dur: 0.8, from: "server", to: "students", label: "page", tone: "good" },
      { kind: "say", at: 3, actor: "server", text: "restarting", tone: "bad" },
      { kind: "mark", at: 3, actor: "server", tone: "bad" },
      { kind: "fly", at: 3.4, dur: 0.8, from: "students", to: "server", label: "open notes" },
      { kind: "say", at: 4.2, actor: "students", text: "error page", tone: "bad" },
      { kind: "fly", at: 4.5, dur: 0.8, from: "students", to: "server", label: "retry" },
      { kind: "say", at: 5.3, actor: "students", text: "all 8,000 out", tone: "bad" },
      { kind: "verdict", at: 5.5, text: "One server down, every student out", tone: "bad" },
    ],
    loop: 8.5,
  },
};
