import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 6.5 beat 1 (watch only): a chat app on a phone sits untouched for an hour
// behind a router whose NAT row has an idle timeout. The strip is minutes since
// the last message, 0 to 60. A model timeout of 5 minutes (300 s) is marked on
// it; the number is made up for teaching, not a real router's [S18, S51]. When
// the chat server sends a message at minute 60 the router has no row for it,
// so the message does not reach the phone; opening the app makes the phone
// send a packet, which makes a new row, and then messages arrive again. The
// phone, router and server are made up.
export const netM6SceneQuietChat = {
  kind: "scene",
  title: "The chat app went quiet",
  purpose: "A chat app sits untouched for an hour and a message from the server does not arrive. Opening the app makes messages flow again.",
  limits:
    "Three made-up devices and a model timer of 5 minutes (300 s), chosen for teaching. A real router's timer is different, and many chat apps send keepalives or reconnect on their own, so this shows one cause and not every chat problem. The picture does not say whether the router drops the message or answers with a reset; both leave it undelivered.",
  scene: {
    width: 420,
    height: 340,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "chat app open", x: 70, y: 84 },
      { id: "router", label: "Router", kind: "router", x: 210, y: 84 },
      { id: "server", label: "Chat server", kind: "server", x: 350, y: 84 },
      { id: "clock", label: "Quiet time", kind: "clock", x: 70, y: 190 },
    ],
    strip: { y: 292, from: 0, to: 60, unit: "", caption: "minutes since the last message", every: 10 },
    events: [
      { kind: "fly", at: 0.2, dur: 0.9, from: "phone", to: "router", label: "hello" },
      { kind: "fly", at: 1.1, dur: 0.9, from: "router", to: "server", label: "hello" },
      { kind: "say", at: 1.2, actor: "router", text: "row: active", tone: "good" },
      { kind: "fly", at: 2.2, dur: 0.9, from: "server", to: "router", label: "message", tone: "good" },
      { kind: "fly", at: 3.1, dur: 0.9, from: "router", to: "phone", label: "message", tone: "good" },
      { kind: "say", at: 4, actor: "phone", text: "got message", tone: "good" },
      { kind: "tag", at: 4, row: 0, value: 0, label: "last message", tone: "good" },
      { kind: "say", at: 4.8, actor: "phone", text: "app is quiet" },
      { kind: "wait", at: 4.8, dur: 4.4, actor: "clock", label: "{n} min quiet", doneLabel: "60 min quiet", total: 60 },
      { kind: "line", at: 5.6, value: 5, label: "5 min" },
      { kind: "say", at: 6, actor: "router", text: "row expired", tone: "warn" },
      { kind: "mark", at: 6, actor: "router", tone: "warn" },
      { kind: "tag", at: 9.4, row: 1, value: 60, label: "server sends", tone: "bad" },
      { kind: "fly", at: 9.4, dur: 0.9, from: "server", to: "router", label: "message", tone: "bad" },
      { kind: "say", at: 10.4, actor: "router", text: "no row: stopped", tone: "bad" },
      { kind: "say", at: 10.4, actor: "phone", text: "nothing arrives", tone: "warn" },
      { kind: "verdict", at: 10.6, text: "Row gone: the message is stopped.", tone: "warn" },
      { kind: "say", at: 12, actor: "phone", text: "opens the app", tone: "accent" },
      { kind: "fly", at: 12, dur: 0.9, from: "phone", to: "router", label: "hello" },
      { kind: "say", at: 12.9, actor: "router", text: "new row", tone: "good" },
      { kind: "fly", at: 13.2, dur: 0.9, from: "server", to: "router", label: "message", tone: "good" },
      { kind: "fly", at: 14.1, dur: 0.9, from: "router", to: "phone", label: "message", tone: "good" },
      { kind: "say", at: 15, actor: "phone", text: "message arrives", tone: "good" },
      { kind: "verdict", at: 15, text: "App opened: new row, messages flow.", tone: "good" },
    ],
    loop: 18,
  },
} satisfies SceneSpec;
