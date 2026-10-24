import type { StateMachineSpec } from "../renderers/state-machine/types";

// Building Habits That Last course, chapter 3.4 "When the power and the
// internet fail". Khaled's study habit over the same four evenings (Monday
// normal, Tuesday weak internet, Wednesday and Thursday no power in the
// evening) twice: with a full, a backup and a smallest version (4 of 4 done,
// then back to full when conditions return), and with only one version (1 of
// 4 done, a gap of three days). See spec.md.
export const powerCutBackupPlan: StateMachineSpec = {
  kind: "state-machine",
  title: "Three versions through a hard week",
  purpose: "Follow one habit with a full, a backup and a smallest version through weak internet and no power, then the same week with only one version.",
  summary:
    "With three versions, Khaled does the full version on Monday, the backup version on Tuesday when the internet is weak, the smallest version on Wednesday with no power, and the backup again on Thursday: 4 of 4 evenings, then back to the full version when the power returns. With only one version, he studies on Monday and misses Tuesday, Wednesday and Thursday: 1 of 4 evenings and a gap of three days.",
  states: [
    { id: "full", name: "Full version", sub: "lesson, 20 min", col: 0, row: 0 },
    { id: "backup", name: "Backup version", sub: "workbook, 10 min", col: 1, row: 0 },
    { id: "smallest", name: "Smallest version", sub: "read card, 2 min", col: 2, row: 0 },
    { id: "one", name: "Only one version", sub: "lesson or nothing", col: 0, row: 1 },
    { id: "missed", name: "Day missed", sub: "Tuesday", col: 1, row: 1 },
    { id: "gap", name: "Three days missed", sub: "harder to restart", col: 2, row: 1 },
  ],
  edges: [
    { from: "full", to: "backup", label: "weak net" },
    { from: "backup", to: "smallest", label: "no power" },
    { from: "one", to: "missed", label: "weak net" },
    { from: "missed", to: "gap", label: "no power" },
  ],
  steps: [
    {
      state: "full",
      title: "Monday: a normal evening",
      note: "At 22:00 the laptop is charged and today's lesson plays. Full version: one video lesson and its exercise in the workbook, 20 minutes. At the end, he writes three lines on a summary card.",
      chips: ["needs: laptop, lesson, light"],
    },
    {
      state: "backup",
      edge: 0,
      title: "Tuesday: weak internet",
      note: "The lesson will not load, and he had not downloaded it. His if-then line: 'If the lesson will not load, then I do one exercise from the workbook.' Backup version by the lamp, 10 minutes. Done.",
      chips: ["needs: workbook, lamp", "no internet needed"],
    },
    {
      state: "smallest",
      edge: 1,
      tone: "good",
      outcome: "still done",
      title: "Wednesday: no power in the evening",
      note: "The new power schedule starts: power only from 06:00 to 14:00. The lamp is flat and he is very tired. Smallest version: he reads yesterday's summary card by the phone torch, 2 minutes. It counts.",
      chips: ["needs: the card, any light"],
    },
    {
      state: "backup",
      tone: "good",
      outcome: "done",
      title: "Thursday: prepared in the power hours",
      note: "Still no power in the evening, but this morning he charged the lamp while the power was on. Backup version again: one exercise, 10 minutes.",
      chips: ["lamp charged at 10:00"],
    },
    {
      state: "full",
      tone: "good",
      outcome: "4 of 4",
      title: "Back to full when conditions return",
      note: "In the morning power hours he downloads the next three lessons. On the first evening with power again, he goes straight back to the full version. Tracker for the four evenings: 4 of 4 done, two of them short.",
      chips: ["4 of 4 evenings", "no gap"],
    },
    {
      state: "one",
      title: "The same week with one version",
      note: "Now imagine the habit had only one version: 'watch one video lesson'. Monday is a normal evening, so he studies.",
      chips: ["Monday: done"],
    },
    {
      state: "missed",
      edge: 2,
      tone: "bad",
      outcome: "missed",
      title: "Tuesday: nothing",
      note: "The lesson will not load. There is no other version, so there is no study tonight, and the sofa and the phone fill the evening.",
    },
    {
      state: "gap",
      edge: 3,
      tone: "bad",
      outcome: "1 of 4",
      title: "Wednesday and Thursday: nothing",
      note: "No power in the evening, so no lesson. The tracker reads 1 of 4, with a gap of three days. When the power returns, he must restart the habit after the gap, not just continue it.",
      chips: ["1 of 4 evenings", "gap: 3 days"],
    },
  ],
  tryThis: [
    "Check the prediction you made above the canvas: which habit ends the week with nothing to restart?",
    "At step 3, ask what Khaled needed the day before to make the smallest version possible tonight.",
  ],
  limits:
    "Real weeks are messier than four evenings, and some evenings even the smallest version will not happen. Three versions keep most evenings going, not every evening. Done in some form is what this tracker counts; the full version still matters, so the plan always goes back to it when the power and the internet return.",
};
