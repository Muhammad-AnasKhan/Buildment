import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 14.03 "Sadaqah".
// Sadaqah does not decrease wealth. A small weekly amount, given quietly, is a
// habit even a child can keep.
// See spec.md.
export const quietSadaqah: SequenceSpec = {
  kind: "sequence",
  title: "A small, quiet sadaqah",
  purpose: "Follow Musa's weekly sadaqah and see each step with its source.",
  summary: "Musa sets aside a tenth of his pocket money each Friday, gives it quietly, gives away clothes he has outgrown, and helps a classmate who cannot afford a book.",
  actors: [
    { name: "Musa" },
    { name: "His sadaqah box" },
    { name: "Those in need" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "a tenth, Fridays",
      title: "A fixed small amount",
      note: "Each Friday a tenth of his pocket money goes into a box. Charity does not decrease wealth (Sahih Muslim 2588).",
      chips: ["Sahih Muslim 2588"],
    },
    {
      from: 1,
      to: 2,
      label: "given quietly",
      tone: "good",
      title: "Quietly",
      note: "Among those Allah shades is one who gives charity so quietly that his left hand does not know what his right hand gave (Sahih al-Bukhari 1423).",
      chips: ["Sahih al-Bukhari 1423"],
    },
    {
      from: 0,
      to: 2,
      label: "outgrown clothes",
      title: "Things, not only money",
      note: "Clothes he has outgrown, washed and folded, go to a family who need them.",
    },
    {
      from: 0,
      to: 2,
      label: "a classmate's book",
      title: "Easing hardship",
      note: "Whoever eases hardship for someone, Allah eases for him in this world and the next (Sahih Muslim 2699).",
      chips: ["Sahih Muslim 2699"],
    },
  ],
  tryThis: [
    "Before step 2, predict: is sadaqah better given openly or quietly, according to this canvas?",
    "What small fixed amount could you set aside each week?",
  ],
  limits: "Zakat is an obligation with its own rules and is different from voluntary sadaqah; ask a scholar about zakat. Giving openly can also be good when it encourages others; the habit here guards the heart.",
};
