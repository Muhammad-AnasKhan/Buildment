import type { StateMachineSpec } from "../renderers/state-machine/types";

// Founder Interview course, chapter 3.4 "The resume line audit".
// Every resume line is checked in the same order: what I did, why, what
// happened, how I know, what I would change. Karam's checkout line fails two
// checks and is rewritten, not defended. His second line passes all five and is
// kept as it is. See spec.md.
export const resumeLineAudit: StateMachineSpec = {
  kind: "state-machine",
  title: "The five checks on Karam's resume lines",
  purpose: "Check one resume line against five questions in order, rewrite the line that fails, and see a line that passes and stays as it is.",
  summary:
    "A resume line is checked for what I did, why, what happened, how I know and what I would change. Karam's line says he led the checkout redesign and raised conversion by 20 percent. It fails the first check, because the designer led and he built it, and the fourth, because the 20 percent came from his manager's slide. He rewrites it with the verb he can defend and the source of the number. His second line, a date picker fix with support emails falling from 7 to 0, passes all five checks and stays.",
  states: [
    { id: "did", name: "1 What I did", sub: "my own part", col: 0, row: 0 },
    { id: "why", name: "2 Why", sub: "reason at the time", col: 1, row: 0 },
    { id: "happened", name: "3 What happened", sub: "the result", col: 2, row: 0 },
    { id: "know", name: "4 How I know", sub: "the source", col: 2, row: 1 },
    { id: "change", name: "5 What I'd change", sub: "next time", col: 1, row: 1 },
    { id: "verdict", name: "Rewrite or keep", sub: "the decision", col: 0, row: 1 },
  ],
  edges: [
    { from: "did", to: "why", label: "ok" },
    { from: "why", to: "happened", label: "ok" },
    { from: "happened", to: "know", label: "ok" },
    { from: "know", to: "change", label: "ok" },
    { from: "change", to: "verdict", label: "ok" },
  ],
  steps: [
    {
      state: "did",
      edge: 0,
      title: "The line to check",
      note: "Karam's resume says: Led the redesign of the checkout page, increasing conversion by 20 percent. The audit asks five questions, in order, and writes one honest answer to each.",
      chips: ["Led the redesign of the checkout page, increasing conversion by 20 percent"],
    },
    {
      state: "did",
      tone: "bad",
      outcome: "fails",
      title: "Check 1: what did I do?",
      note: "The designer led the redesign. Karam built the page from the designer's screens. The word led says more than he did, and one founder question, what exactly did you do, shows it. The fix is a verb he can defend.",
      chips: ["designer led", "Karam built it"],
    },
    {
      state: "why",
      edge: 1,
      tone: "good",
      outcome: "know it",
      title: "Check 2: why?",
      note: "The line does not need to give the reason, but Karam must know it. From chapter 3.3: his manager asked, and inside that he chose to build the form as one page, about two days faster. He has the real reason, so this check passes.",
      chips: ["manager asked", "my choice: one page"],
    },
    {
      state: "happened",
      edge: 2,
      tone: "warn",
      outcome: "unclear",
      title: "Check 3: what happened?",
      note: "The line says conversion rose 20 percent. A result needs a before, an after and a time window, from chapter 2.2. Karam has only the final figure, with no before and no window.",
    },
    {
      state: "know",
      edge: 3,
      tone: "bad",
      outcome: "fails",
      title: "Check 4: how do I know?",
      note: "The 20 percent came from his manager's slide. Karam does not know how it was measured, or how much of it came from his page. A number he cannot source cannot stay in the line as his own.",
      chips: ["source: manager's slide", "method: unknown"],
    },
    {
      state: "change",
      edge: 4,
      tone: "good",
      outcome: "have it",
      title: "Check 5: what would I change?",
      note: "Karam would ask for the visit and order counts before and after, with dates, before he put a number on the page. This answer is honest and short, so the check passes.",
    },
    {
      state: "verdict",
      tone: "good",
      outcome: "rewrite it",
      title: "Rewrite, do not defend",
      note: "The line now reads: Built the redesigned checkout page from the designer's screens. Conversion rose 20 percent after launch (my manager's figure; I did not measure it). In the room he can add: I do not know how the 20 percent was measured.",
      chips: ["true verb", "source named", "gap said"],
    },
    {
      state: "verdict",
      tone: "good",
      outcome: "keep as it is",
      title: "A line that passes stays",
      note: "Karam's second line: Fixed the date picker on the order form that stopped some phones from submitting orders. Support emails about it fell from 7 in the month before to 0 in the month after. It passes all five checks, so he does not polish it.",
      chips: ["did: fixed", "source: support inbox", "7 before, 0 after"],
    },
  ],
  tryThis: [
    "Before step 2, read the line and guess which check it fails first. Then check your guess.",
    "At step 7, say the rewritten line aloud. Could you answer a founder's why about every word in it?",
  ],
  limits:
    "The five checks find lines you cannot defend. They do not make a weak project strong, and they do not judge whether a result is large enough. A line can pass all five checks and still be a poor choice to put first. Two careful people can write different honest versions of the same line.",
};
