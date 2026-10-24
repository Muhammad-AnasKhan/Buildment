import type { DesignSpec } from "../models/design-stepper";

// PasteBox (a fictional pastebin) through the six steps of chapter 1.4.
// Numbers are the chapter's: 100,000 pastes a day is about 12 reads a
// second; at about 0.5 ms a query the database is under 1% busy; IDs are 6
// random characters checked by a unique key; one database is the weak spot,
// and the next time round the loop adds a standby copy.
//
// Layout on a 420 by 320 picture: the scope note and its answers top left,
// the request path down the left and across (browser, balancer, two apps,
// database), the cache that was considered top right, the standby bottom right.

export const pasteBoxDesign: DesignSpec = {
  width: 420,
  height: 320,
  empty: { text: "No blocks drawn yet", x: 136, y: 140, width: 274, height: 170 },
  steps: [
    {
      id: "clarify",
      title: "Clarify",
      patch: {
        actors: [{ id: "scope", label: "Scope", kind: "note", x: 66, y: 80 }],
        tags: [
          { id: "size", text: "up to 1 MB", x: 188, y: 60, tone: "accent" },
          { id: "keep", text: "kept 30 days", x: 188, y: 84, tone: "accent" },
          { id: "edit", text: "no edits", x: 188, y: 108, tone: "accent" },
        ],
        status: { scope: { text: "3 answers", tone: "accent" } },
        mark: { scope: "accent" },
      },
      verdict: { text: "Scope fixed before any drawing", tone: "good" },
      says: "Three answers fix the scope before anything is drawn.",
      hint: "Tap Next, or tap any step above.",
    },
    {
      id: "estimate",
      title: "Estimate",
      patch: {
        tags: [{ id: "load", text: "12 reads/s", x: 66, y: 212, tone: "accent" }],
      },
      verdict: { text: "Small numbers: keep it simple", tone: "good" },
      says: "100,000 pastes a day is about 12 reads a second. Small.",
      hint: "The chip is the number that drives the design.",
    },
    {
      id: "sketch",
      title: "Sketch",
      patch: {
        actors: [
          { id: "browser", label: "Browser", kind: "user", x: 66, y: 165 },
          { id: "lb", label: "Balancer", kind: "router", x: 66, y: 260 },
          { id: "app1", label: "App 1", kind: "server", x: 210, y: 175 },
          { id: "app2", label: "App 2", kind: "server", x: 210, y: 275 },
          { id: "db", label: "Database", kind: "database", x: 354, y: 175 },
        ],
        links: [
          { id: "browser-lb", from: "browser", to: "lb" },
          { id: "lb-app1", from: "lb", to: "app1" },
          { id: "lb-app2", from: "lb", to: "app2" },
          { id: "app1-db", from: "app1", to: "db" },
          { id: "app2-db", from: "app2", to: "db" },
        ],
        status: {
          browser: { text: "reads, writes" },
          lb: { text: "health checks" },
          app1: { text: "stateless" },
          app2: { text: "stateless" },
          db: { text: "pastes table" },
        },
        flows: [
          { path: ["browser", "lb", "app1", "db"], label: "read" },
          { path: ["browser", "lb", "app2", "db"], label: "write", offset: 0.5 },
        ],
      },
      verdict: { text: "The simplest design that fits", tone: "good" },
      says: "Two app servers and one table. The second app is for crashes, not speed.",
      hint: "Watch a read and a write run through.",
    },
    {
      id: "deep-dive",
      title: "Deep dive",
      patch: {
        tags: [{ id: "unique", text: "id: unique key", x: 354, y: 127, tone: "accent" }],
        status: {
          app1: { text: "saved aB3xY9", tone: "good" },
          app2: { text: "taken: retry", tone: "warn" },
          db: { text: "catches clash", tone: "good" },
        },
        flows: [
          { path: ["app2", "db"], label: "aB3xY9", tone: "bad" },
          { path: ["app1", "db"], label: "aB3xY9", tone: "good", offset: 0.5 },
        ],
        mark: { db: "accent" },
      },
      verdict: { text: "The unique key catches the clash", tone: "good" },
      says: "Both apps picked aB3xY9. The unique key refuses the second insert.",
      hint: "Watch App 2's insert get refused.",
    },
    {
      id: "trade-offs",
      title: "Trade-offs",
      patch: {
        actors: [{ id: "cache", label: "Cache", kind: "cache", x: 354, y: 80 }],
        ghost: ["cache"],
        status: {
          cache: { text: "not added" },
          app1: { text: "stateless" },
          app2: { text: "stateless" },
          db: { text: "<1% busy", tone: "good" },
        },
        flows: [
          { path: ["browser", "lb", "app1", "db"], label: "read" },
          { path: ["browser", "lb", "app2", "db"], label: "read", offset: 0.5 },
        ],
      },
      verdict: { text: "At 12 reads/s, skip the cache", tone: "good" },
      says: "At 12 reads a second the database is under 1% busy.",
      hint: "Tap the cache to add it, then take it away.",
      action: {
        toggle: true,
        phases: [
          { button: "Add a cache", target: "cache" },
          {
            button: "Remove the cache",
            target: "cache",
            patch: {
              unghost: ["cache"],
              links: [{ id: "app1-cache", from: "app1", to: "cache" }],
              status: { cache: { text: "+cost, +stale", tone: "warn" }, db: { text: "still <1% busy", tone: "accent" } },
              flows: [{ path: ["browser", "lb", "app1", "cache"], label: "read" }],
            },
            verdict: { text: "A cache adds cost, buys little", tone: "warn" },
            says: "The cache adds a bill, a part that can fail, and stale copies.",
          },
        ],
      },
    },
    {
      id: "failure",
      title: "Failure",
      patch: {
        status: {
          browser: { text: "reads, writes" },
          db: { text: "only copy", tone: "warn" },
        },
        flows: [
          { path: ["browser", "lb", "app1", "db"], label: "read" },
          { path: ["browser", "lb", "app2", "db"], label: "write", offset: 0.5 },
        ],
      },
      verdict: { text: "One database. What if it dies?", tone: "warn" },
      says: "The app servers come in a pair. The database does not.",
      hint: "Tap the database, or the button, to break it.",
      action: {
        phases: [
          { button: "Break the database", target: "db" },
          {
            button: "Add a standby",
            patch: {
              broken: ["db"],
              status: { db: { text: "down", tone: "bad" }, browser: { text: "errors", tone: "bad" } },
            },
            verdict: { text: "Database down: every request fails", tone: "bad" },
            says: "With one database, one failure stops every request.",
          },
          {
            button: "Break the database",
            target: "db",
            patch: {
              fixed: ["db"],
              actors: [{ id: "standby", label: "Standby", kind: "database", x: 354, y: 275 }],
              links: [{ id: "db-standby", from: "db", to: "standby" }],
              status: {
                db: { text: "primary", tone: "good" },
                standby: { text: "<1 s behind", tone: "accent" },
                browser: { text: "reads, writes" },
              },
              mark: { standby: "accent" },
            },
            verdict: { text: "Standby ready. Break it again", tone: "accent" },
            says: "Next time round the loop: a copy kept on a second machine.",
          },
          {
            button: "Start over",
            patch: {
              broken: ["db"],
              links: [
                { id: "app1-standby", from: "app1", to: "standby" },
                { id: "app2-standby", from: "app2", to: "standby" },
              ],
              status: {
                db: { text: "down", tone: "bad" },
                standby: { text: "now primary", tone: "good" },
                browser: { text: "served", tone: "good" },
              },
              flows: [
                { path: ["browser", "lb", "app1", "standby"], label: "read" },
                { path: ["browser", "lb", "app2", "standby"], label: "write", offset: 0.5 },
              ],
              mark: { standby: "good" },
            },
            verdict: { text: "Standby takes over: users served", tone: "good" },
            says: "The standby takes over, but it may lose the last moments of writes.",
          },
        ],
      },
    },
  ],
};
