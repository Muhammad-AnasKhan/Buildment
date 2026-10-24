import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 17.4 beat 1 (The budget is what the SLO lets fail).
export const sysdesignM17BudgetSpend: SceneSpec = {
  kind: "scene",
  title: "A 99.9% SLO over 30 days allows 43 bad minutes, and two incidents spend most of them",
  purpose: "The budget starts at 43 minutes. A 10 minute problem on day 6 spends 10. A 25 minute bad deploy on day 19 spends 25 more. By day 19 only 8 minutes are left.",
  limits: "Time-based for the picture: 0.1% of 30 days is 43.2 minutes. A request-based SLO spends its budget by failed requests, so a busy-hour outage costs more than a night-time one. The two incidents are course numbers.",
  scene: {
    width: 420,
    height: 340,
    actors: [
      { id: "team", label: "Team", kind: "user", sub: "43 min left", x: 60, y: 100 },
      { id: "svc", label: "Orders", kind: "server", sub: "SLO 99.9%", x: 360, y: 100 },
    ],
    strip: { y: 300, from: 0, to: 30, unit: "days", caption: "the 30-day window", every: 5 },
    events: [
      { kind: "say", at: 0.3, actor: "team", text: "43 min left", tone: "good" },
      { kind: "tag", at: 1, row: 0, value: 6, label: "10 min bad", tone: "warn" },
      { kind: "say", at: 1.4, actor: "team", text: "33 min left", tone: "warn" },
      { kind: "say", at: 1.4, actor: "svc", text: "recovered", tone: "good" },
      { kind: "tag", at: 2.6, row: 0, value: 19, label: "25 min bad", tone: "bad" },
      { kind: "say", at: 3, actor: "team", text: "8 min left", tone: "bad" },
      { kind: "mark", at: 3, actor: "team", tone: "bad" },
      { kind: "verdict", at: 3.8, text: "35 of 43 minutes spent by day 19", tone: "warn" },
    ],
    loop: 7.5,
  },
};
