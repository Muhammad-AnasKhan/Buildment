import type { SequenceSpec } from "../renderers/sequence/types";

// Think Clearly course, chapter 7.4 "Check the AI's answer".
// Huda checks an AI answer about a scholarship three ways: rough numbers,
// asking for the source, and reading the source itself. The scholarship is
// fictional. See spec.md.
export const checkTheAiAnswer: SequenceSpec = {
  kind: "sequence",
  title: "Huda checks an AI answer about a scholarship",
  purpose: "See how rough numbers, a request for the source and the source itself catch an answer that sounded sure.",
  summary:
    "Huda asks an AI tool for a scholarship's deadline and monthly pay. The answer sounds sure, but its numbers do not add up. Huda asks for the source, gets only a name, opens the organisation's own page, finds a different deadline and amount, checks that those numbers agree, and uses the page's facts.",
  actors: [
    { name: "Huda", sub: "you" },
    { name: "AI tool", sub: "a chat app" },
    { name: "Source", sub: "official page" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "clear question",
      title: "Huda asks a clear question",
      note: "'What is the application deadline for the Bright Path Scholarship, and how much does it pay each month?' Two facts, asked plainly.",
      chips: ["deadline?", "pay per month?"],
    },
    {
      from: 1,
      to: 0,
      label: "a sure answer",
      title: "The answer sounds sure",
      note: "'The deadline is 15 March. The scholarship pays 2,000 dollars per month for 12 months, a total of 2,400 dollars.' No 'maybe', no 'I am not sure'.",
      chips: ["deadline: 15 March", "2,000 per month", "total: 2,400"],
    },
    {
      from: 0,
      to: 0,
      label: "rough numbers",
      tone: "warn",
      outcome: "does not add up",
      title: "Check 1: do the numbers agree?",
      note: "2,000 dollars a month for 12 months is about 24,000 dollars, not 2,400. One of the numbers must be wrong. Sounding sure is not the same as being right.",
      chips: ["2,000 x 12 = 24,000", "answer said 2,400"],
    },
    {
      from: 0,
      to: 1,
      label: "your source?",
      title: "Check 2: ask where it comes from",
      note: "Huda asks: 'Where does this information come from? Please give the exact page and the words it uses.'",
    },
    {
      from: 1,
      to: 0,
      label: "only a name",
      tone: "warn",
      outcome: "not a source",
      title: "A name is not a source",
      note: "The tool says 'the official scholarship website' but cannot show the exact words. A name of a source is a claim, not proof. Huda still has to look herself.",
    },
    {
      from: 0,
      to: 2,
      label: "open the page",
      title: "Go to the source itself",
      note: "Huda opens the organisation's own website, not a forwarded message or a copy on another site, and finds the scholarship page.",
    },
    {
      from: 2,
      to: 0,
      label: "the real facts",
      tone: "good",
      title: "The source says something different",
      note: "The page says: deadline 1 March, 200 dollars per month for 12 months. The deadline is two weeks earlier than the AI said.",
      chips: ["deadline: 1 March", "200 per month", "12 months"],
    },
    {
      from: 0,
      to: 0,
      label: "check another way",
      tone: "good",
      outcome: "two checks agree",
      title: "Check 3: solve it another way",
      note: "200 dollars a month for 12 months is 2,400 dollars, which matches the total. The page agrees with itself. Huda writes 1 March in her calendar. Trusting the AI would have made her miss the deadline.",
      chips: ["200 x 12 = 2,400", "deadline: 1 March"],
    },
  ],
  tryThis: [
    "Before step 3, multiply 2,000 by 12 in your head. Does it match the total in the answer?",
    "Which check found the wrong deadline: the rough numbers or the source? Why could the rough numbers not find it?",
  ],
  limits:
    "Here the source is easy to find and clear. Real sources can be old, hard to find, or wrong too. When a source and an AI disagree, trust the organisation's own, most recent page, and if it is still unclear, ask the organisation directly.",
};
