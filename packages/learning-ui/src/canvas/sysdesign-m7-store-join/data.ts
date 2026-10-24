import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.2 beat 2. A relational database keeps related facts in linked tables and can combine them in one query, inside one transaction.
export const sysdesignM7StoreJoin: SceneSpec = {
  kind: "scene",
  title: "A relational store joins three tables in one query",
  purpose: "The 'My tickets' page needs a ticket, its event and its venue. One query joins the three tables and returns one answer.",
  limits: "Joins are cheap here because the three tables sit in one database. If they sit on different machines, a join becomes several trips, which is why sharding (module 9) makes joins harder.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "app", label: "Ticketline app", kind: "server", sub: "my tickets page", x: 60, y: 100 },
      { id: "db", label: "Relational", kind: "database", sub: "3 linked tables", x: 360, y: 100 },
      { id: "tickets", label: "tickets", kind: "note", sub: "buyer, seat", x: 70, y: 255 },
      { id: "events", label: "events", kind: "note", sub: "name, date", x: 210, y: 255 },
      { id: "venues", label: "venues", kind: "note", sub: "city, hall", x: 350, y: 255 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "app", to: "db", label: "3 tables, 1 query" },
      { kind: "fly", at: 1.3, dur: 0.5, from: "db", to: "tickets", label: "read" },
      { kind: "fly", at: 1.5, dur: 0.5, from: "db", to: "events", label: "read" },
      { kind: "fly", at: 1.7, dur: 0.5, from: "db", to: "venues", label: "read" },
      { kind: "say", at: 2.4, actor: "db", text: "joined 3 tables", tone: "good" },
      { kind: "fly", at: 2.7, dur: 0.9, from: "db", to: "app", label: "1 answer", tone: "good" },
      { kind: "say", at: 3.7, actor: "app", text: "page ready", tone: "good" },
      { kind: "verdict", at: 3.9, text: "One query, one trip, one answer", tone: "good" },
    ],
    loop: 6.7,
  },
};
