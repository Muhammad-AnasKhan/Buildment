import type { SequenceSpec } from "../renderers/sequence/types";

// Building Habits That Last course, chapter 6.3 "Study and focused work
// habits". Dina's 30-minute English block after work: a start signal, the
// phone in another room, the next step already written down, an interruption
// from her mother handled with a quick note and a return, and tomorrow's first
// step written at the end. See spec.md.
export const dinaStudyBlock: SequenceSpec = {
  kind: "sequence",
  title: "Dina's study block: start, interruption, return",
  purpose: "Step through one 30-minute study block and see what protects it: a start signal, the phone out of the room, a written next step, and a quick note when someone needs you.",
  summary:
    "At 12:40 Dina closes her work laptop and fills a glass of water, her start signal. She puts her phone on the kitchen shelf, reads the next step she wrote yesterday, and starts. After 15 minutes her mother calls. Dina writes where she stopped, helps her mother for five minutes, comes back, reads her note and carries on. At the end she writes tomorrow's first step.",
  actors: [
    { name: "Dina", sub: "English block" },
    { name: "Phone", sub: "kitchen shelf" },
    { name: "Notebook", sub: "next step" },
    { name: "Mother", sub: "next room" },
  ],
  steps: [
    {
      from: 0,
      to: 0,
      label: "start signal",
      title: "12:40: the same signal every day",
      note: "Dina sends her last test report, closes the work laptop and fills a glass of water. She sits at the same end of the table with her English book. Same place, same signal: she does not have to decide to begin.",
      chips: ["close laptop", "glass of water", "same seat"],
    },
    {
      from: 0,
      to: 1,
      label: "phone to kitchen",
      title: "The phone leaves the room",
      note: "She puts her phone on the kitchen shelf, face down. Her mother is in the next room and can call her by voice, so nobody needs the phone for the next 30 minutes.",
    },
    {
      from: 0,
      to: 2,
      label: "read next step",
      title: "No deciding what to do",
      note: "Yesterday's last line in the notebook says: 'Next: lesson 12, exercise 3, the past tense.' She opens the book at that page and starts at once.",
      chips: ["lesson 12, exercise 3"],
    },
    {
      from: 0,
      to: 2,
      label: "focused work",
      title: "The start was easy; the work is still work",
      note: "For 15 minutes she writes answers and checks them. The habit got her to the table with the right page open. The thinking still takes effort, and that is normal.",
    },
    {
      from: 3,
      to: 0,
      label: "'Dina, help?'",
      tone: "warn",
      outcome: "interruption",
      title: "12:55: her mother calls",
      note: "Her mother needs help to reach a high shelf. This is part of Dina's day, not a failure of the block.",
    },
    {
      from: 0,
      to: 2,
      label: "quick note",
      title: "Ten seconds before she stands up",
      note: "She writes: 'Stopped at question 6.' Now the block can wait without being lost.",
      chips: ["stopped at question 6"],
    },
    {
      from: 0,
      to: 3,
      label: "help, 5 min",
      title: "Help, without guilt",
      note: "She helps her mother for about five minutes. She does not hurry and she does not decide that the block is ruined.",
    },
    {
      from: 0,
      to: 2,
      label: "back to Q6",
      tone: "good",
      outcome: "back",
      title: "Return, read the note, carry on",
      note: "She sits down, reads 'question 6' and carries on. The block ends at 13:15 instead of 13:10. Abandoning it would have cost the whole day's study; the note cost ten seconds.",
    },
    {
      from: 0,
      to: 2,
      label: "write next step",
      tone: "good",
      outcome: "ready",
      title: "Leave tomorrow's start ready",
      note: "Before she closes the book she writes: 'Next: question 7, then read page 40 aloud.' Tomorrow's block can start without a decision.",
      chips: ["next: question 7"],
    },
  ],
  tryThis: [
    "Before step 6, predict what Dina does when her mother calls: stop the block for today, or write a quick note and come back. Then check.",
    "Find the two steps where Dina writes something down. What would each block look like without them?",
  ],
  limits:
    "Here the interruption was short and came once. Some days bring many interruptions or a long one; then the smallest version (read one page aloud) counts, and the next block starts from the note. A start signal makes starting easier; it does not make hard thinking easy.",
};
