import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 22.4 beat 8: presence changes go only to the people who are looking at that person.
export const sysdesignM22PresenceSubscribe: SceneSpec = {
  kind: "scene",
  title: "Tell only the people who are looking",
  purpose: "Layla opens Sami's chat, so the presence store lists her as a watcher. When Sami comes online, only Layla is told. Dana has Sami in a long contact list but is not looking, so she gets nothing.",
  limits: "Watchers last only while a chat is open. A phone that opens a chat asks once for the current status, then gets changes. Large groups usually show no presence at all.",
  scene: {
    width: 420,
    height: 340,
    actors: [
      { id: "layla", label: "Layla", kind: "phone", sub: "opens a chat", x: 70, y: 100 },
      { id: "pres", label: "Presence", kind: "cache", sub: "0 watchers", x: 350, y: 100 },
      { id: "dana", label: "Dana", kind: "phone", sub: "contact list", x: 70, y: 245 },
      { id: "sami", label: "Sami", kind: "phone", sub: "offline", x: 350, y: 245 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "layla", to: "pres", label: "watch Sami" },
      { kind: "say", at: 1.2, actor: "pres", text: "1 watcher", tone: "accent" },
      { kind: "say", at: 1.8, actor: "sami", text: "app opens", tone: "good" },
      { kind: "fly", at: 2.0, dur: 0.9, from: "sami", to: "pres", label: "I am online" },
      { kind: "fly", at: 2.9, dur: 0.9, from: "pres", to: "layla", label: "Sami online", tone: "good" },
      { kind: "say", at: 3.8, actor: "layla", text: "Sami: online", tone: "good" },
      { kind: "say", at: 3.9, actor: "dana", text: "told nothing", tone: "good" },
      { kind: "fly", at: 4.4, dur: 0.9, from: "layla", to: "pres", label: "stop watching" },
      { kind: "say", at: 5.3, actor: "pres", text: "0 watchers", tone: "accent" },
      { kind: "verdict", at: 5.4, text: "Tell only people who are looking", tone: "good" },
    ],
    loop: 8.4,
  },
};
