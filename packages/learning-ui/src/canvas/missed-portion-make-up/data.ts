import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 03.03 "When a day is missed".
// A missed day is not the end of a habit. The Sunnah gives a way to make up a
// missed portion, and it records the usual deed for someone who is ill or
// travelling.
// See spec.md.
export const missedPortionMakeUp: SequenceSpec = {
  kind: "sequence",
  title: "When the page is missed",
  purpose: "Step through two missed days in Hamza's Quran habit and see what he does after each.",
  summary: "Hamza oversleeps and misses his page after Fajr, so he reads it before Dhuhr; later he falls ill for three days and reads only what he can; on the first healthy morning he returns to his usual page without trying to catch up all at once.",
  actors: [
    { name: "Hamza" },
    { name: "His page", sub: "after Fajr" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "overslept",
      tone: "warn",
      outcome: "missed",
      title: "Tuesday: he oversleeps",
      note: "He prays Fajr late and rushes to work. No page. He feels the old thought: 'I broke it, so what is the point.'",
    },
    {
      from: 0,
      to: 1,
      label: "before Dhuhr",
      tone: "good",
      outcome: "made up",
      title: "He makes it up before Dhuhr",
      note: "At 11:00 he reads his page at his desk. Whoever sleeps through his portion of the Quran, or part of it, and reads it between Fajr and Dhuhr, it is written for him as if he read it at night (Sahih Muslim 747).",
      chips: ["Sahih Muslim 747"],
    },
    {
      from: 0,
      to: 0,
      label: "ill, 3 days",
      title: "He falls ill",
      note: "A fever keeps him in bed for three days. He listens to a recitation when he can, and does not force a page. When a servant falls ill or travels, there is written for him the like of what he used to do when healthy and at home (Sahih al-Bukhari 2996).",
      chips: ["Sahih al-Bukhari 2996"],
    },
    {
      from: 0,
      to: 1,
      label: "back to 1 page",
      tone: "good",
      outcome: "restarted",
      title: "First healthy morning: back to normal",
      note: "On the first morning he is well, he reads his usual page after Fajr. He does not try to read the missed pages in one sitting. The habit is the cue and the page, not the debt.",
    },
  ],
  tryThis: [
    "Before step 2, predict: once Fajr has passed, is a missed portion simply lost?",
    "At step 4, why does Hamza not read all the missed pages at once?",
  ],
  limits: "Sahih Muslim 747 speaks of a portion missed through sleep. Sahih al-Bukhari 2996 speaks of illness and travel, not choosing to skip. This canvas is about a voluntary daily portion. A missed obligatory prayer is a different matter: pray it as soon as you remember (Sahih Muslim 684), and ask a scholar about details.",
};
