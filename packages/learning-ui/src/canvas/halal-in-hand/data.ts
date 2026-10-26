import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 13.04 "Halal provision and money".
// What we earn, eat and spend is part of worship. The Sunnah links halal
// income to accepted dua, and forbids cheating and waste.
// See spec.md.
export const halalInHand: SequenceSpec = {
  kind: "sequence",
  title: "Honest from first sale to last",
  purpose: "Follow one day in a small shop and one month of pocket money, and see each money habit with its source.",
  summary: "Hamza's uncle shows a fault in a product to a buyer, gives full weight, refuses an easy dishonest profit; Musa budgets his pocket money, separates needs from wants, and does not waste his parents' money.",
  actors: [
    { name: "His uncle", sub: "shopkeeper" },
    { name: "A buyer" },
    { name: "Musa", sub: "pocket money" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "shows the fault",
      title: "No hidden faults",
      note: "The Prophet, peace be upon him, put his hand into a pile of grain and found it wet underneath. He said: why not put it on top so people can see? Whoever cheats is not of me (Sahih Muslim 102).",
      chips: ["Sahih Muslim 102"],
    },
    {
      from: 0,
      to: 1,
      label: "full weight",
      title: "Full measure",
      note: "Woe to those who give less: they take in full from people, but give less when they measure for them (Quran 83:1 to 3).",
      chips: ["Quran 83:1-3"],
    },
    {
      from: 0,
      to: 0,
      label: "no easy profit",
      tone: "good",
      title: "Only the good",
      note: "Allah is good and accepts only what is good. The Prophet mentioned a traveller raising his hands in dua, whose food, drink and clothing were haram: how can he be answered? (Sahih Muslim 1015).",
      chips: ["Sahih Muslim 1015"],
    },
    {
      from: 2,
      to: 2,
      label: "needs vs wants",
      title: "Moderation",
      note: "Those who, when they spend, are neither wasteful nor stingy, but in between (Quran 25:67). Eat and drink but do not waste (Quran 7:31).",
      chips: ["Quran 25:67", "Quran 7:31"],
    },
    {
      from: 2,
      to: 2,
      label: "parents' money",
      tone: "good",
      title: "Respecting what is given",
      note: "Pocket money is a trust from his parents. He keeps a small notebook of what he spends, and sets aside a little for sadaqah (module 14).",
    },
  ],
  tryThis: [
    "Before step 3, predict: according to Sahih Muslim 1015, what can block a dua from being answered?",
    "What is one 'want' you could move out of your spending this month?",
  ],
  limits: "Rulings on specific kinds of income, interest and contracts are fiqh; ask a qualified scholar. A warning that flesh grown from haram is nearer the Fire is in Jami' at-Tirmidhi 614 (graded sahih by al-Albani); this course teaches it gently, as a reason to choose halal, not to despair.",
};
