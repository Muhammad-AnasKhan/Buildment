import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 17.2 beat 2 (One id joins the lines).
export const sysdesignM17LogLines: SceneSpec = {
  kind: "scene",
  title: "Three servers each write a log line for one order, and one id joins them",
  purpose: "Order r-4471 touches the api, menu and payments services. Each writes its own log line with the same request id, so a search for that id finds all three.",
  limits: "Three services and one order. The id r-4471 is made up. Real systems write thousands of lines a second, so search needs an index, and keeping every line costs storage.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "api", label: "Api", kind: "server", sub: "writes a line", x: 60, y: 100 },
      { id: "menu", label: "Menu", kind: "server", sub: "writes a line", x: 210, y: 100 },
      { id: "pay", label: "Payments", kind: "server", sub: "writes a line", x: 360, y: 100 },
      { id: "search", label: "Log search", kind: "database", sub: "empty", x: 210, y: 250 },
    ],
    events: [
      { kind: "say", at: 0.2, actor: "api", text: "order r-4471", tone: "accent" },
      { kind: "say", at: 0.2, actor: "menu", text: "order r-4471", tone: "accent" },
      { kind: "say", at: 0.2, actor: "pay", text: "order r-4471", tone: "accent" },
      { kind: "fly", at: 0.6, dur: 0.9, from: "api", to: "search", label: "id=r-4471", tone: "accent" },
      { kind: "fly", at: 1.1, dur: 0.9, from: "menu", to: "search", label: "id=r-4471", tone: "accent" },
      { kind: "fly", at: 1.6, dur: 0.9, from: "pay", to: "search", label: "id=r-4471", tone: "accent" },
      { kind: "say", at: 2.6, actor: "search", text: "3 lines, 1 id", tone: "good" },
      { kind: "mark", at: 2.6, actor: "search", tone: "good" },
      { kind: "verdict", at: 3.3, text: "One id joins lines from 3 servers", tone: "good" },
    ],
    loop: 6.5,
  },
};
