import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 11.02 "Truth, thanks, forgiveness and anger".
// Good character shows most in hard moments. One angry meeting tests truth,
// anger control, apology and forgiveness all at once.
// See spec.md.
export const aHotMoment: SequenceSpec = {
  kind: "sequence",
  title: "An angry meeting",
  purpose: "Step through one tense meeting and see the sourced action at each moment.",
  summary: "In a meeting a colleague blames Hamza unfairly; he feels anger, sits back and seeks refuge in Allah, tells the truth calmly, apologises for his own small part, forgives, and later thanks the colleague who helped fix the problem.",
  actors: [
    { name: "Hamza" },
    { name: "Usman", sub: "colleague" },
    { name: "The team" },
  ],
  steps: [
    {
      from: 1,
      to: 0,
      label: "blames him",
      tone: "warn",
      outcome: "anger",
      title: "Unfair blame",
      note: "Usman says in front of the team that the outage was Hamza's fault. It was mostly not. Hamza's face goes hot.",
    },
    {
      from: 0,
      to: 0,
      label: "sits, refuge",
      title: "Control first",
      note: "The strong man is not the one who wrestles others down; the strong man controls himself when angry (Sahih al-Bukhari 6114). He sits back and says under his breath: I seek refuge in Allah from Satan (Sahih al-Bukhari 3282).",
      chips: ["Sahih al-Bukhari 6114", "Sahih al-Bukhari 3282"],
    },
    {
      from: 0,
      to: 2,
      label: "the facts, calmly",
      title: "Truth, gently",
      note: "He shares the timeline calmly, without attacking Usman. Truthfulness leads to righteousness (Sahih al-Bukhari 6094).",
      chips: ["Sahih al-Bukhari 6094"],
    },
    {
      from: 0,
      to: 2,
      label: "my part: sorry",
      title: "Apologise for your part",
      note: "One config change was his. He says so and apologises for it. Admitting your part is not weakness.",
    },
    {
      from: 0,
      to: 1,
      label: "forgives",
      tone: "good",
      title: "Forgive",
      note: "Those who restrain anger and pardon people; Allah loves those who do good (Quran 3:134). No one forgives except that Allah increases him in honour (Sahih Muslim 2588).",
      chips: ["Quran 3:134", "Sahih Muslim 2588"],
    },
    {
      from: 0,
      to: 2,
      label: "thanks a helper",
      tone: "good",
      title: "Thank people",
      note: "Whoever does not thank people does not thank Allah (Sunan Abi Dawud 4811, sahih). He thanks the colleague who stayed late to help.",
      chips: ["Sunan Abi Dawud 4811"],
    },
  ],
  tryThis: [
    "Before step 2, predict: what does the Sunnah call real strength?",
    "Which step would be hardest for you in a moment like this?",
  ],
  limits: "Forgiving does not mean accepting continued harm; where there is real wrong, seek fair help. This canvas shows a workplace conflict; the same steps apply at home.",
};
