import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 22.3 beat 2: the chat service asks the registry where a user is; a miss means "offline path".
export const sysdesignM22RouteLookup: SceneSpec = {
  kind: "scene",
  title: "Ask the registry, then deliver or keep it",
  purpose: "The chat service asks the registry which gateway holds Sami and sends the message there. For Dana the registry has no entry, so the message is kept and a push alert is sent.",
  limits: "The registry answer can be a little old: a phone may have left a moment ago. So the gateway must report whether the phone really received it, which the next beats show.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "chat", label: "Chat", kind: "server", sub: "msg for Sami", x: 70, y: 100 },
      { id: "reg", label: "Registry", kind: "cache", sub: "sami = gw 2", x: 350, y: 100 },
      { id: "gw", label: "Gateway 2", kind: "router", sub: "holds Sami", x: 350, y: 235 },
      { id: "sami", label: "Sami", kind: "phone", sub: "online", x: 70, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "chat", to: "reg", label: "where is Sami?" },
      { kind: "fly", at: 1.2, dur: 0.8, from: "reg", to: "chat", label: "Gateway 2" },
      { kind: "fly", at: 2.1, dur: 0.9, from: "chat", to: "gw", label: "deliver" },
      { kind: "fly", at: 3.1, dur: 0.9, from: "gw", to: "sami", label: "message", tone: "good" },
      { kind: "say", at: 4.0, actor: "sami", text: "gets it", tone: "good" },
      { kind: "say", at: 4.4, actor: "chat", text: "msg for Dana", tone: "accent" },
      { kind: "fly", at: 4.5, dur: 0.8, from: "chat", to: "reg", label: "where is Dana?" },
      { kind: "say", at: 5.3, actor: "reg", text: "no entry", tone: "warn" },
      { kind: "fly", at: 5.4, dur: 0.8, from: "reg", to: "chat", label: "not online", tone: "warn" },
      { kind: "say", at: 6.2, actor: "chat", text: "keep, send push", tone: "warn" },
      { kind: "verdict", at: 6.3, text: "Found: deliver. Missing: keep it", tone: "good" },
    ],
    loop: 9.5,
  },
};
