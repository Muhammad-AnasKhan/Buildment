import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 10.02 "The tongue".
// Speech is the habit we use most. The Sunnah gives one rule for all of it,
// say good or be silent, and names the kinds of speech to avoid.
// See spec.md.
export const beforeYouSpeak: SequenceSpec = {
  kind: "sequence",
  title: "Five seconds before speaking",
  purpose: "Follow one lunch break and see where the tongue is tested, and the source for each test.",
  summary: "At lunch, colleagues mock a manager's accent, gossip about a colleague and share a rumour; Hamza listens first, says nothing harmful, declines to pass the tale on, speaks gently, and changes the subject with something good.",
  actors: [
    { name: "Hamza" },
    { name: "Colleagues", sub: "lunch" },
  ],
  steps: [
    {
      from: 0,
      to: 0,
      label: "good or silent",
      title: "The rule",
      note: "Whoever believes in Allah and the Last Day, let him say good or be silent (Sahih Muslim 47).",
      chips: ["Sahih Muslim 47"],
    },
    {
      from: 1,
      to: 0,
      label: "mocking an accent",
      tone: "warn",
      title: "Mockery",
      note: "Let not a people mock another people; they may be better than them; do not call each other by offensive names (Quran 49:11). Hamza does not laugh along.",
      chips: ["Quran 49:11"],
    },
    {
      from: 1,
      to: 0,
      label: "about Sara",
      tone: "warn",
      title: "Backbiting",
      note: "Backbiting is mentioning your brother in a way he dislikes. If it is true, it is backbiting; if it is false, it is slander (Sahih Muslim 2589). He says: let's not talk about her when she isn't here.",
      chips: ["Sahih Muslim 2589"],
    },
    {
      from: 0,
      to: 1,
      label: "won't pass it on",
      title: "Tale-bearing",
      note: "A tale-bearer will not enter Paradise (Sahih al-Bukhari 6056). What he heard stays with him.",
      chips: ["Sahih al-Bukhari 6056"],
    },
    {
      from: 0,
      to: 1,
      label: "gently",
      title: "Gentle and truthful",
      note: "Lower your voice (Quran 31:19). Truthfulness leads to righteousness, and righteousness leads to Paradise (Sahih al-Bukhari 6094).",
      chips: ["Quran 31:19", "Sahih al-Bukhari 6094"],
    },
    {
      from: 0,
      to: 0,
      label: "a guarantee",
      tone: "good",
      outcome: "why",
      title: "Why it matters",
      note: "Whoever guarantees what is between his jaws and between his legs, I guarantee Paradise for him (Sahih al-Bukhari 6474).",
      chips: ["Sahih al-Bukhari 6474"],
    },
  ],
  tryThis: [
    "Before step 3, predict: if what is said about Sara is true, is it still backbiting?",
    "Which of these tests comes up most in your week?",
  ],
  limits: "Scholars list exceptions where speaking about someone is allowed, such as asking for help against wrong or giving a needed warning; learn them from a scholar. This canvas shows a few common tests, not every case.",
};
