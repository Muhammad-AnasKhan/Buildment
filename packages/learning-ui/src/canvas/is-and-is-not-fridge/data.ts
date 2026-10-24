import type { SequenceSpec } from "../renderers/sequence/types";

// Why Things Happen course, chapter 5.2 "Describe the problem exactly".
// Majed's pharmacy fridge: each fact from the "is and is not" description
// rules out one cause, until only something about fridge 2 itself is left.
// See spec.md.
export const isAndIsNotFridge: SequenceSpec = {
  kind: "sequence",
  title: "Is and is not: why is fridge 2 warm?",
  purpose: "See how each fact about what is and is not affected rules out a cause, before anything is opened or bought.",
  summary:
    "Majed reads 12 degrees in fridge 2 and 4 degrees in fridge 1, which stands in the same room on the same power strip. That rules out the room and the power. A second thermometer also reads 12, so the thermometer is ruled out. Boxes from Thursday's delivery stop the door of fridge 2 from closing. He moves them, the fridge is at 5 degrees the next morning, and he puts the warm medicines aside until they are checked.",
  actors: [
    { name: "Majed", sub: "pharmacist" },
    { name: "Fridge 2", sub: "the problem" },
    { name: "Fridge 1", sub: "same room" },
    { name: "Back room", sub: "deliveries" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "read thermometer",
      title: "What is affected",
      note: "Fridge 2 shows 12 degrees Celsius on every shelf. It should be between 2 and 8. The morning check first showed 11 degrees on Thursday.",
      chips: ["12 degrees", "every shelf", "since Thursday"],
    },
    {
      from: 0,
      to: 2,
      label: "compare fridge 1",
      tone: "good",
      outcome: "room ruled out",
      title: "What is not affected",
      note: "Fridge 1 stands next to fridge 2, in the same back room, and shows 4 degrees. A hot room would warm both fridges, so the room is ruled out.",
      chips: ["4 degrees", "same room"],
    },
    {
      from: 0,
      to: 1,
      label: "light and motor",
      tone: "good",
      outcome: "power ruled out",
      title: "Is the power weak?",
      note: "Both fridges use the same power strip, and fridge 1 works. The light inside fridge 2 is on and its motor hums. Weak power is ruled out.",
    },
    {
      from: 0,
      to: 1,
      label: "second thermometer",
      tone: "good",
      outcome: "thermometer ruled out",
      title: "Is the thermometer wrong?",
      note: "Majed puts a second thermometer in fridge 2 for an hour. It also shows 12 degrees, so the first thermometer was telling the truth.",
    },
    {
      from: 0,
      to: 3,
      label: "what changed?",
      tone: "warn",
      outcome: "door not shut",
      title: "What changed on Thursday?",
      note: "A large delivery arrived on Thursday. Some boxes were stacked on the bottom shelf of fridge 2, and they stop its door from closing fully.",
      chips: ["Thursday delivery", "door open a little"],
    },
    {
      from: 0,
      to: 1,
      label: "move the boxes",
      tone: "good",
      outcome: "5 degrees",
      title: "Fix it, then check the fix",
      note: "He moves the boxes and closes the door. The next morning fridge 2 shows 5 degrees, and it stays there for the rest of the week.",
    },
    {
      from: 0,
      to: 0,
      label: "medicines aside",
      tone: "warn",
      outcome: "not sold yet",
      title: "Keep patients safe",
      note: "The medicines in fridge 2 were kept too warm for days. Majed puts them aside and does not sell them until the supplier or a pharmacist says they are safe.",
    },
  ],
  tryThis: [
    "Before step 2, predict whether a hot back room could explain fridge 2's problem. Then check.",
    "At each step, name the cause that the new fact rules out. Which cause is still left at step 5?",
  ],
  limits:
    "Here one fact rules out one cause, and the real cause was easy to see once Majed asked what changed. Real problems can have two causes at once, and some faults are inside the fridge. Never open a fridge or any other device yourself: with a clear description, a repair person knows where to start.",
};
