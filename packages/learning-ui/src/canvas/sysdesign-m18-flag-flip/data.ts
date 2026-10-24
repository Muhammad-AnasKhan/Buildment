import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.6 beat 5 (Feature flags: release is not deploy).
export const sysdesignM18FlagFlip: SceneSpec = {
  kind: "scene",
  title: "A feature flag turns a new feature off in seconds, with no deploy",
  purpose: "v2 is already deployed with the new search switched off. A flag turns it on for 5% of users, a bug appears, and one flag change turns it off again.",
  limits: "Flags live in config the app reads. Old flags left in the code become clutter and risk, so remove them after the launch. A flag only helps if the code path behind it is safe to switch at any time.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "you", label: "You", kind: "user", x: 60, y: 145 },
      { id: "flag", label: "Flag", kind: "note", sub: "search: off", x: 210, y: 145 },
      { id: "app", label: "App v2", kind: "server", sub: "new code, dark", x: 360, y: 95 },
      { id: "users", label: "Users", kind: "user", x: 360, y: 195 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "you", to: "flag", label: "search: 5%" },
      { kind: "say", at: 1, actor: "flag", text: "search: 5%", tone: "accent" },
      { kind: "fly", at: 1.2, dur: 0.7, from: "flag", to: "app", label: "config" },
      { kind: "say", at: 2, actor: "app", text: "5% see new", tone: "accent" },
      { kind: "fly", at: 2.3, dur: 0.7, from: "users", to: "app", label: "request" },
      { kind: "say", at: 3.1, actor: "users", text: "5% hit a bug", tone: "bad" },
      { kind: "fly", at: 3.5, dur: 0.7, from: "you", to: "flag", label: "search: off" },
      { kind: "say", at: 4.2, actor: "flag", text: "search: off", tone: "good" },
      { kind: "say", at: 4.4, actor: "app", text: "0% see new", tone: "good" },
      { kind: "say", at: 4.5, actor: "users", text: "all fine", tone: "good" },
      { kind: "verdict", at: 4.8, text: "Off in seconds, no deploy", tone: "good" },
    ],
    loop: 7.8,
  },
};
