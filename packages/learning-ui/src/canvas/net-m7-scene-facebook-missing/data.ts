import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.4 beat 1 (watch only): 4 October 2021, from the company's own account
// [S48]. A maintenance command meant to assess backbone capacity took down the
// backbone connections between its data centres. Its DNS servers could not
// reach the data centres, so they withdrew their route announcements. The
// servers still existed, but the rest of the internet had no route to them, so
// nobody could look up the names. The story is told in four boxes; the real
// outage involved many more systems, and the post gives no total duration.
export const netM7SceneFacebookMissing = {
  kind: "scene",
  title: "The servers existed, but nobody could find them",
  purpose: "On 4 October 2021 a maintenance command cut the links between Facebook's data centres. Its DNS servers withdrew their routes, and nobody could look up the names.",
  limits:
    "A simplified retelling of Facebook's own account of 4 October 2021 [S48]. The real outage involved many more systems, and the account gives no total duration, so none is shown. Route announcements (BGP) are not taught in this course; chapter 4.5 shows the idea. Here they only show that a name needs a route to the servers that answer for it.",
  scene: {
    width: 420,
    height: 340,
    actors: [
      { id: "user", label: "Phone", kind: "phone", sub: "opens the app", x: 62, y: 120 },
      { id: "resolver", label: "Resolver", kind: "server", sub: "asks for it", x: 210, y: 120 },
      { id: "dns", label: "DNS servers", kind: "server", sub: "still running", x: 358, y: 120 },
      { id: "dc", label: "Data centres", kind: "database", sub: "linked", x: 358, y: 244 },
    ],
    events: [
      { kind: "say", at: 0.5, actor: "dc", text: "links cut", tone: "bad" },
      { kind: "mark", at: 0.5, actor: "dc", tone: "bad" },
      { kind: "say", at: 2, actor: "dns", text: "no link to DCs", tone: "warn" },
      { kind: "say", at: 3.4, actor: "dns", text: "route withdrawn", tone: "bad" },
      { kind: "mark", at: 3.4, actor: "dns", tone: "bad" },
      { kind: "fly", at: 4.7, dur: 1.3, from: "user", to: "resolver", label: "address?" },
      { kind: "fly", at: 5.9, dur: 1.3, from: "resolver", to: "dns", label: "address?", tone: "warn" },
      { kind: "say", at: 7.4, actor: "resolver", text: "no route", tone: "bad" },
      { kind: "say", at: 7.4, actor: "user", text: "cannot find it", tone: "bad" },
      { kind: "verdict", at: 7.9, text: "Servers exist, no route to them", tone: "bad" },
    ],
    loop: 13.5,
  },
} satisfies SceneSpec;
