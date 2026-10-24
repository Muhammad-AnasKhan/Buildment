import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.5 beat 2: long polling. The server holds the request open until there is
// something to say, answers at once when Omar writes at 6 s, and the app
// immediately asks again (RFC 6202).
export const sysdesignM3LongPolling: SceneSpec = {
  kind: "scene",
  title: "Long polling: the server holds the question",
  purpose: "The app asks once and the server keeps the request open until a message arrives, then answers at once.",
  limits: "One user and one message, made up for the picture. Real servers end a held request after a time limit with an empty answer, and the app asks again; that is not drawn.",
  scene: {
    width: 420,
    height: 360,
    actors: [
      { id: "server", kind: "server", label: "Chat server", sub: "no new messages", x: 60, y: 200 },
      { id: "phone", kind: "phone", label: "Phone", sub: "asks once", x: 360, y: 90 },
    ],
    strip: { y: 330, from: 0, to: 15, unit: "s", caption: "seconds", every: 5 },
    events: [
      { kind: "fly", at: 0.2, dur: 0.5, from: "phone", to: "server", label: "new? (0 s)" },
      { kind: "say", at: 0.7, actor: "server", text: "nothing: hold" },
      { kind: "wait", at: 0.7, dur: 2.1, actor: "server", label: "holding {n} s", doneLabel: "held 6 s", total: 6 },
      { kind: "say", at: 2.8, actor: "server", text: "Omar wrote", tone: "warn" },
      { kind: "tag", at: 2.8, row: 0, value: 6, label: "sent 6 s" },
      { kind: "fly", at: 2.9, dur: 0.5, from: "server", to: "phone", label: "1 message", tone: "good" },
      { kind: "say", at: 3.4, actor: "phone", text: "seen at once", tone: "good" },
      { kind: "tag", at: 3.4, row: 1, value: 6, label: "seen 6 s", tone: "good" },
      { kind: "fly", at: 3.6, dur: 0.5, from: "phone", to: "server", label: "new? (6 s)" },
      { kind: "say", at: 4.1, actor: "server", text: "holding again" },
      { kind: "verdict", at: 4.3, text: "Held open, answered at once", tone: "good" },
    ],
    loop: 7,
  },
};
