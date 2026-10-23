import type { StateMachineSpec } from "../renderers/state-machine/types";

// Building Habits That Last course, chapter 7.2 "Reading your 30 days".
// Samir's month of reading 10 pages after the evening meal, reviewed in order:
// count the days done, find when the misses fell, group the notes by cause,
// choose one change for the biggest cause, test it for two weeks, then decide
// again. A last step shows why three changes at once cannot be read. See spec.md.
export const thirtyDayReview: StateMachineSpec = {
  kind: "state-machine",
  title: "Reading 30 days: Samir's review",
  purpose:
    "Step through one month of tracking in order and see how counts, timing and notes lead to one change and a two-week test.",
  summary:
    "Samir read on 23 of 30 evenings, with a longest gap of 2 evenings. Days 1 to 15 had 1 miss and days 16 to 30 had 6. His notes show 4 misses on dark evenings after the power schedule changed on day 17, 2 on Fridays at his uncle's home and 1 for a late client call. He chooses one change, a charged lamp on the shelf by the book, tests it for two weeks, and then decides again. A last step shows why three changes at once cannot be read.",
  states: [
    { id: "count", name: "Count days done", sub: "23 of 30", col: 0, row: 0 },
    { id: "when", name: "When misses fell", sub: "1, then 6", col: 1, row: 0 },
    { id: "causes", name: "Causes in notes", sub: "dark evenings: 4", col: 2, row: 0 },
    { id: "change", name: "Choose one change", sub: "a charged lamp", col: 2, row: 1 },
    { id: "test", name: "Test for 2 weeks", sub: "1 of 5 before", col: 1, row: 1 },
    { id: "decide", name: "Keep, change, drop", sub: "look again", col: 0, row: 1 },
  ],
  edges: [
    { from: "count", to: "when", label: "then" },
    { from: "when", to: "causes", label: "why?" },
    { from: "causes", to: "change", label: "so" },
    { from: "change", to: "test", label: "try it" },
    { from: "test", to: "decide", label: "after" },
    { from: "decide", to: "count", label: "new" },
  ],
  steps: [
    {
      state: "count",
      edge: 0,
      title: "Step 1: how often?",
      note: "Samir read his 10 pages on 23 of 30 evenings. His longest run was 9 evenings, days 8 to 16. His longest gap was 2 evenings, days 17 and 18, and he restarted on day 19.",
      chips: ["23 of 30 done", "longest gap: 2"],
    },
    {
      state: "when",
      edge: 1,
      title: "Step 2: when did the misses fall?",
      note: "Days 1 to 15: 14 done, 1 missed. Days 16 to 30: 9 done, 6 missed. Something made the second half harder. Two misses were Fridays, but the other two Fridays were done, so Friday alone is not the pattern.",
      chips: ["days 1 to 15: 1 miss", "days 16 to 30: 6 misses"],
    },
    {
      state: "causes",
      edge: 2,
      title: "Step 3: read the notes",
      note: "Power off after the meal, too dark: 4 misses, on days 17, 18, 24 and 27. Friday meal at his uncle's home: 2, on days 7 and 21. A late client call: 1, on day 29. The power schedule changed on day 17, and the evenings went dark.",
      chips: ["dark: 4", "uncle's: 2", "late call: 1"],
    },
    {
      state: "change",
      edge: 3,
      tone: "good",
      outcome: "one change",
      title: "Step 4: choose one change",
      note: "Dark evenings cause the most misses. On ordinary evenings at home he read on 22 of 23, so the anchor works. On day 22 the power was off and he read by his sister's lamp. So he keeps the anchor and changes the place: he charges a small lamp while the power is on and keeps it on the shelf by the book.",
      chips: ["biggest cause first", "Fridays: next review"],
    },
    {
      state: "test",
      edge: 4,
      title: "Step 5: test it for two weeks",
      note: "Before the change, he read on 1 of 5 dark evenings, and that one was with a lamp. For the next two weeks he counts the dark evenings and how many he still reads on. If he reads on most of them, the lamp probably helped.",
      chips: ["before: 1 of 5", "count: dark evenings"],
    },
    {
      state: "decide",
      edge: 5,
      tone: "warn",
      outcome: "a hint",
      title: "Step 6: keep, change or drop",
      note: "After two weeks he looks again. Two weeks is a hint, not proof: there may be only a few dark evenings. If the lamp helps, he keeps it, counts a new month, and looks at the Friday visits next.",
    },
    {
      state: "change",
      tone: "bad",
      outcome: "three changes",
      title: "The trap: three changes at once",
      note: "Suppose Samir moves his reading to the mornings, reads 15 pages and buys a lamp, all in the same month. If the month goes better, he cannot tell which change helped. If it goes worse, he cannot tell which one hurt.",
    },
  ],
  tryThis: [
    "At step 4, check the guess you made above the canvas: did Samir keep his anchor, or move his reading to an hour when it is light?",
    "At step 7, ask what Samir would learn next month if he changed three things at once.",
  ],
  limits:
    "This is one month for one person. Real months can have two causes of the same size, notes can be missing, and two weeks may hold only a few of the days you want to test. Two weeks is a hint, not proof, so look again after the next two weeks.",
};
