import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 2.1 beat (watch only): "IPv4 ran out" means the free pool of unallocated
// addresses emptied, not that addresses stopped working. A website keeps
// answering a visitor while the registries run out one by one: IANA on
// 3 February 2011 [S13], APNIC's final /8 on 15 April 2011 [S14], ARIN on
// 24 September 2015 [S16] and RIPE NCC on 25 November 2019 [S15]. After that
// addresses move by waiting list and transfer. The strip is the year, so each
// date sits where it fell: 3 Feb is 2011.09, 15 Apr 2011.29, 24 Sep 2015.73
// and 25 Nov 2019.90. The ring beside the pool fills as the free pool drains.
// The visitor, the old holder and the website are made up.
export const netM2SceneFreePool: SceneSpec = {
  kind: "scene",
  title: "The free pool runs out and the web keeps working",
  purpose:
    "The free pool of IPv4 addresses empties registry by registry, from IANA in February 2011 to RIPE NCC in November 2019. A website keeps answering a visitor throughout, and addresses then move by waiting list and transfer.",
  limits:
    "Four dates from the registries' own announcements; APNIC's date is its final /8 policy starting, not an empty store. One pool stands for every registry's pool. The old holder, the visitor and the website are made up, and the ring shows how much of the pool is gone, not a measured percentage.",
  scene: {
    width: 420,
    height: 348,
    actors: [
      { id: "pool", label: "Free pool", kind: "database", x: 70, y: 84 },
      { id: "site", label: "Website", kind: "server", x: 350, y: 84 },
      { id: "wait", label: "Waitlist", kind: "queue", x: 70, y: 190 },
      { id: "old", label: "Old holder", kind: "server", x: 210, y: 190 },
      { id: "visitor", label: "Visitor", kind: "user", x: 350, y: 190 },
    ],
    strip: { y: 320, from: 2011, to: 2020, unit: "", caption: "when each free pool ran out", every: 1 },
    events: [
      { kind: "say", at: 0.1, actor: "pool", text: "plenty free", tone: "good" },
      { kind: "say", at: 0.1, actor: "site", text: "answering", tone: "good" },
      { kind: "fly", at: 0.5, dur: 0.9, from: "visitor", to: "site", label: "GET /" },
      { kind: "fly", at: 1.5, dur: 0.9, from: "site", to: "visitor", label: "page", tone: "good" },
      { kind: "wait", at: 1.6, dur: 6, actor: "pool", label: "{n}% gone", doneLabel: "all gone", total: 100 },
      { kind: "tag", at: 2, row: 0, value: 2011.09, label: "3 Feb 2011", tone: "warn" },
      { kind: "say", at: 2, actor: "pool", text: "IANA: empty", tone: "warn" },
      { kind: "mark", at: 2, actor: "pool", tone: "warn" },
      { kind: "tag", at: 3.4, row: 1, value: 2011.29, label: "15 Apr 2011", tone: "warn" },
      { kind: "say", at: 3.4, actor: "pool", text: "APNIC: last /8", tone: "warn" },
      { kind: "fly", at: 4.4, dur: 0.9, from: "visitor", to: "site", label: "GET /" },
      { kind: "fly", at: 5.4, dur: 0.9, from: "site", to: "visitor", label: "page", tone: "good" },
      { kind: "tag", at: 5.4, row: 0, value: 2015.73, label: "24 Sep 2015", tone: "warn" },
      { kind: "say", at: 5.4, actor: "pool", text: "ARIN: zero", tone: "warn" },
      { kind: "tag", at: 7, row: 0, value: 2019.9, label: "25 Nov 2019", tone: "bad" },
      { kind: "say", at: 7, actor: "pool", text: "RIPE: empty", tone: "bad" },
      { kind: "mark", at: 7, actor: "pool", tone: "bad" },
      { kind: "say", at: 7.9, actor: "pool", text: "pool empty", tone: "bad" },
      { kind: "say", at: 8.2, actor: "old", text: "sells a block", tone: "accent" },
      { kind: "fly", at: 8.4, dur: 1.1, from: "old", to: "wait", label: "a /24" },
      { kind: "say", at: 9.6, actor: "wait", text: "gets a /24", tone: "good" },
      { kind: "fly", at: 10, dur: 0.9, from: "visitor", to: "site", label: "GET /" },
      { kind: "fly", at: 11, dur: 0.9, from: "site", to: "visitor", label: "page", tone: "good" },
      { kind: "say", at: 12, actor: "site", text: "still answering", tone: "good" },
      { kind: "verdict", at: 12, text: "Pool empty. The web still works.", tone: "good" },
    ],
    loop: 15,
  },
};
