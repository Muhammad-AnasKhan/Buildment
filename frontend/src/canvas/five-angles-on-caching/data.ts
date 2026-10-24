import type { SequenceSpec } from "../renderers/sequence/types";

// Learn and Build with AI course, chapter 3.3 "One topic, five angles".
// In week 7 of her plan, Yara learns caching for Qasir, her link shortener,
// from five angles: her own words, a picture, a worked example, a failure case
// and her lab days 3 and 4. Each angle finds a gap the others miss. See spec.md.
export const fiveAnglesOnCaching: SequenceSpec = {
  kind: "sequence",
  title: "Five angles on caching",
  purpose: "See how each of five angles on one topic finds a gap that the others miss.",
  summary:
    "In week 7, Yara asks a chat assistant to explain caching, then writes it in her own words and finds she cannot say what happens on a miss. The AI's diagram, checked against her book, is missing an arrow. Tracing two clicks shows the second click would not be counted. Asking what breaks shows an edited link keeps sending people to the old page. On lab day 3, making the log say whether the cache or the database answered each click shows she had no way to tell if the cache was working. Her notes page lists all five gaps.",
  actors: [
    { name: "Yara", sub: "Qasir" },
    { name: "Chat assistant", sub: "any one" },
    { name: "Her notes", sub: "caching page" },
    { name: "Her lab", sub: "qasir-labs" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "explain caching",
      title: "Start with a plain explanation",
      note: "The chat assistant explains: a cache is a small, fast store for answers that are asked for often. For Qasir, it would keep each short code with its long link, so most clicks do not need the database.",
    },
    {
      from: 0,
      to: 2,
      label: "in my own words",
      tone: "warn",
      outcome: "gap: a miss",
      title: "Angle 1: her own words",
      note: "She closes the chat and writes: 'When a short link is clicked, Qasir looks in the cache first. If the link is there, it sends the person on at once.' Then she stops. What happens when the code is not in the cache yet?",
    },
    {
      from: 0,
      to: 1,
      label: "draw it as boxes",
      tone: "warn",
      outcome: "arrow missing",
      title: "Angle 2: a picture",
      note: "The AI draws browser, app, cache and database. She checks every arrow against the caching chapter of her system design book. The picture has no arrow for the app saving a copy into the cache after it reads the database. She fixes her drawing.",
      chips: ["checked against her book"],
    },
    {
      from: 0,
      to: 2,
      label: "trace two clicks",
      tone: "warn",
      outcome: "gap: lost clicks",
      title: "Angle 3: a worked example",
      note: "On paper she traces two clicks on one short link. Click 1: not in the cache, read the database, save a copy, send the person on. Click 2: found in the cache. In her first plan, a click was counted when the app read the database, so click 2 would not be counted.",
      chips: ["click 1: miss", "click 2: hit"],
    },
    {
      from: 0,
      to: 1,
      label: "what breaks?",
      tone: "warn",
      outcome: "gap: old link",
      title: "Angle 4: a failure case",
      note: "She asks what happens when a shop changes where its short link points. The cache still holds the old long link, so people go to the old page until the copy expires or is deleted. She checks this in her book. Her mentor's question is answered.",
      chips: ["fix: an expiry time", "or delete on edit"],
    },
    {
      from: 0,
      to: 3,
      label: "log each answer",
      tone: "warn",
      outcome: "gap: is it working?",
      title: "Angle 5: build it",
      note: "On lab day 3 she makes Qasir's log say, for each click, whether the cache or the database answered. Until now she had no way to tell: both answers look the same to the person clicking. How would she know the cache was working at all? On lab day 4 she uses this log when she stops the cache on purpose.",
      chips: ["lab day 3", "lab day 4"],
    },
    {
      from: 0,
      to: 2,
      label: "list the gaps",
      tone: "good",
      outcome: "5 angles, 5 gaps",
      title: "One page, five gaps",
      note: "Her caching page now lists five gaps, each found by a different angle, each with a fix or an open question. She adds three recall questions for her next review.",
    },
  ],
  tryThis: [
    "At step 4, follow click 2 on the paper trace and see which part answers it, and what that means for the click count.",
    "Cover the outcome badges. For each gap, could a different angle have found it?",
  ],
  limits:
    "This is one fellow's week 7 on one topic, told to show the method. On another topic, two angles may find the same gap, or one angle may find nothing new. Five angles is the course's method built on supported parts, not a tested package.",
};
