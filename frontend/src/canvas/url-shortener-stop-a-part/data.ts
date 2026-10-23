import type { SequenceSpec } from "../renderers/sequence/types";

// Learn and Build with AI course, chapter 4.4 "Watch it run, then break it".
// Yara's lab day 4 on Qasir: app, cache and database in containers, each with
// restart: unless-stopped. She stops the cache (links still work, slower),
// starts it again, then stops the database (new links fail). The timings are
// invented for this example, not measured. Every number matches the chapter. See spec.md.
export const urlShortenerStopAPart: SequenceSpec = {
  kind: "sequence",
  title: "Stop one part of Qasir and watch",
  purpose: "Stop one part at a time and see what each part of a small link shortener is for.",
  summary:
    "With all three parts running, a short link is found in the cache in about 4 ms. Yara stops the cache, which stays stopped because of restart: unless-stopped. The link still opens, but every lookup now goes to the database and takes about 38 ms. She starts the cache again. Then she stops the database: links already in the cache still open, but saving a new short link fails with an error. She starts the database again.",
  actors: [
    { name: "Browser", sub: "Yara" },
    { name: "App", sub: "Qasir" },
    { name: "Cache", sub: "fast copies" },
    { name: "Database", sub: "every link" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "open /k7Qa",
      title: "All three parts running",
      note: "She starts everything with docker compose up -d in her codespace, then opens a short link. Each part has restart: unless-stopped in compose.yaml.",
      chips: ["docker compose up -d"],
    },
    {
      from: 1,
      to: 2,
      label: "look up k7Qa",
      tone: "good",
      outcome: "about 4 ms",
      title: "The cache answers first",
      note: "The app looks in the cache first and finds the long address there. The log line says source=cache, and the browser is sent on to the long address.",
      chips: ["GET /k7Qa source=cache 4ms"],
    },
    {
      from: 2,
      to: 2,
      label: "stop cache",
      tone: "warn",
      outcome: "stopped",
      title: "Stop the cache on purpose",
      note: "docker compose stop cache asks the cache to shut down, and forces it after a short wait. Because of restart: unless-stopped, it stays stopped until she starts it.",
      chips: ["docker compose stop cache"],
    },
    {
      from: 1,
      to: 3,
      label: "look up k7Qa",
      tone: "warn",
      outcome: "about 38 ms",
      title: "The link still opens, more slowly",
      note: "Qasir treats a cache that does not answer like a cache that does not hold the link, so it asks the database. Every lookup now goes to the database, which takes about 38 ms instead of about 4 in this invented example.",
      chips: ["GET /k7Qa source=db 38ms"],
    },
    {
      from: 2,
      to: 2,
      label: "start cache",
      tone: "good",
      outcome: "running",
      title: "Start the cache again",
      note: "docker compose start cache brings it back. Within a lookup or two, the log shows source=cache again.",
      chips: ["docker compose start cache"],
    },
    {
      from: 3,
      to: 3,
      label: "stop db",
      tone: "warn",
      outcome: "stopped",
      title: "Now stop the database",
      note: "docker compose stop db. The link she opened a moment ago still opens, because the cache holds a copy of it.",
      chips: ["docker compose stop db"],
    },
    {
      from: 1,
      to: 3,
      label: "save new link",
      tone: "bad",
      outcome: "error 500",
      title: "A new short link cannot be saved",
      note: "Saving a new link needs the database, and so does any link the cache does not hold. The app returns an error. The cache keeps copies for speed; the database is where every link really lives.",
      chips: ["POST /links 500 database unavailable"],
    },
    {
      from: 3,
      to: 3,
      label: "start db",
      tone: "good",
      outcome: "all running",
      title: "Start it again and write it down",
      note: "docker compose start db brings the database back, and new links save again. She writes her prediction, what happened and the reason in her lab log.",
      chips: ["docker compose start db"],
    },
  ],
  tryThis: [
    "Go to step 4 to check your prediction: the link still opens, and the log line changes from source=cache to source=db.",
    "Before step 7, predict what happens to a link the cache holds, and to a brand new link, when the database stops.",
  ],
  limits:
    "The log lines and the 4 ms and 38 ms timings are invented for this example, not measured. Qasir only keeps working without its cache because its code asks the database when the cache does not answer; an app without that rule would return errors instead. Stop one part at a time, and start it again before the next.",
};
