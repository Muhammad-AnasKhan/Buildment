import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.1 beat 1 (Same code, different result).
export const sysdesignM18LaptopVsServer: SceneSpec = {
  kind: "scene",
  title: "Hana's code works on her laptop and crashes on the server",
  purpose: "The tests pass on Hana's laptop. The same code, copied to the server, crashes, because the two machines are not the same.",
  limits: "A made-up story (Daftar, a fictional notes app). The laptop has Node 24 and a local settings file; the server has an older Node and no settings file. Real differences also include libraries, the operating system and file paths.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "laptop", label: "Laptop", kind: "server", sub: "Node 24, .env", x: 60, y: 100 },
      { id: "server", label: "Server", kind: "server", sub: "Node 18, no env", x: 360, y: 100 },
      { id: "users", label: "Users", kind: "user", x: 210, y: 200 },
    ],
    events: [
      { kind: "say", at: 0.2, actor: "laptop", text: "tests pass", tone: "good" },
      { kind: "fly", at: 0.8, dur: 1, from: "laptop", to: "server", label: "same code" },
      { kind: "say", at: 1.9, actor: "server", text: "crashed", tone: "bad" },
      { kind: "mark", at: 1.9, actor: "server", tone: "bad" },
      { kind: "fly", at: 2.6, dur: 1, from: "users", to: "server", label: "open app" },
      { kind: "say", at: 3.7, actor: "users", text: "502 error", tone: "bad" },
      { kind: "verdict", at: 4.2, text: "Same code, different result", tone: "bad" },
    ],
    loop: 7.2,
  },
};
