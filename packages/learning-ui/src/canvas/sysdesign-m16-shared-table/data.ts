import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 16.3 beat 2 (One owner for the data).
export const sysdesignM16SharedTable: SceneSpec = {
  kind: "scene",
  title: "A shared table is a hidden link between two services",
  purpose: "Reports reads the Orders database table directly. When the Orders team renames a column, Reports breaks without anyone telling the Orders team.",
  limits: "Two services and one rename. Real teams may use views or contracts to soften this, but the link stays hidden until something breaks.",
  scene: {
    width: 420,
    height: 260,
    actors: [
      { id: "orders", label: "Orders", kind: "server", sub: "owns the data", x: 60, y: 100 },
      { id: "reports", label: "Reports", kind: "server", sub: "reads a table", x: 360, y: 100 },
      { id: "db", label: "Orders DB", kind: "database", sub: "column: total", x: 210, y: 195 }
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "reports", to: "db", label: "SELECT total" },
      { kind: "say", at: 1.4, actor: "reports", text: "numbers OK", tone: "good" },
      { kind: "say", at: 2.2, actor: "orders", text: "renames column", tone: "warn" },
      { kind: "fly", at: 2.4, dur: 1, from: "orders", to: "db", label: "total to amount" },
      { kind: "say", at: 3.5, actor: "db", text: "column: amount", tone: "accent" },
      { kind: "fly", at: 4, dur: 1, from: "reports", to: "db", label: "SELECT total" },
      { kind: "say", at: 5.1, actor: "db", text: "no such column", tone: "bad" },
      { kind: "mark", at: 5.1, actor: "db", tone: "bad" },
      { kind: "say", at: 5.3, actor: "reports", text: "report broken", tone: "bad" },
      { kind: "verdict", at: 5.6, text: "A shared table is a hidden link", tone: "bad" }
    ],
    loop: 8.8,
  },
};
