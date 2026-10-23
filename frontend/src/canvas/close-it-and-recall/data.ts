import type { StateMachineSpec } from "../renderers/state-machine/types";

// Learn and Build with AI course, chapter 3.2 "The fluency trap".
// Lina reads a clear AI explanation of splitting a network, feels she knows
// it, closes it and recalls on a blank page, finds two gaps, re-studies only
// those, and recalls again three days later. The last step shows the
// rereading route that keeps the gaps hidden. See spec.md.
export const closeItAndRecall: StateMachineSpec = {
  kind: "state-machine",
  title: "Close it and recall",
  purpose: "See why reading a clear explanation feels like knowing, and how recall from a blank page finds the gaps.",
  summary:
    "Lina reads an AI's five steps for splitting a network into four parts three times and rates herself 4 out of 5. She closes the explanation and writes the steps on a blank page. Two of the five steps are missing. She re-studies only those two, in her own words, and three days later recalls all five. Rereading a fourth time instead would have left her feeling she knew it, with both gaps hidden.",
  states: [
    { id: "explanation", name: "AI explanation", sub: "5 clear steps", col: 0, row: 0 },
    { id: "feels", name: "Feels known", sub: "rated 4 of 5", col: 1, row: 0 },
    { id: "blank", name: "Blank page", sub: "explanation closed", col: 2, row: 0 },
    { id: "gaps", name: "Gaps found", sub: "2 of 5 missed", col: 2, row: 1 },
    { id: "restudy", name: "Re-study gaps", sub: "only those 2", col: 1, row: 1 },
    { id: "later", name: "Recall again", sub: "3 days later", col: 0, row: 1 },
  ],
  edges: [
    { from: "explanation", to: "feels", label: "read 3 times" },
    { from: "feels", to: "blank", label: "close it" },
    { from: "blank", to: "gaps", label: "try" },
    { from: "gaps", to: "restudy", label: "study gaps" },
    { from: "restudy", to: "later", label: "wait 3 days" },
  ],
  steps: [
    {
      state: "explanation",
      title: "A clear explanation",
      note: "Lina asks a chat assistant how to split one network into four equal parts. It gives five clear, correct steps, with an example.",
      chips: ["5 steps", "1 example"],
    },
    {
      state: "feels",
      edge: 0,
      tone: "warn",
      outcome: "4 of 5",
      title: "It feels known",
      note: "Each reading is faster than the last. By the third, she knows what each sentence will say. She rates herself 4 out of 5. The rating measures how easy the text felt, not what she can do alone.",
    },
    {
      state: "blank",
      edge: 1,
      title: "Close it and write",
      note: "She closes the chat, turns to a blank page and writes the five steps from memory. Only then does she open the explanation again, to compare line by line.",
      chips: ["no peeking first"],
    },
    {
      state: "gaps",
      edge: 2,
      tone: "warn",
      outcome: "2 of 5 missed",
      title: "The gaps appear",
      note: "Two of the five steps are not on her page. She cannot say why four parts need two extra bits, and she forgot that two addresses in every part are kept back from devices.",
      chips: ["missed: step 1", "missed: step 4"],
    },
    {
      state: "restudy",
      edge: 3,
      title: "Re-study only the gaps",
      note: "She studies two steps, not five. She asks the AI to explain only those, in a few sentences, then closes it and writes each step in her own words.",
    },
    {
      state: "later",
      edge: 4,
      tone: "good",
      outcome: "5 of 5",
      title: "Recall again, days later",
      note: "Three days later she writes all five steps from a blank page. One step is slow, so she marks it for her next review. Recall after a gap of days is what makes the steps stay.",
    },
    {
      state: "feels",
      tone: "bad",
      outcome: "gaps hidden",
      title: "The other route: reread",
      note: "If she had read the explanation a fourth time instead, she would still be here: feeling she knows it, with both gaps hidden until the test finds them.",
    },
  ],
  tryThis: [
    "Go to step 4 and compare what reached the blank page with the 4 out of 5 rating in step 2.",
    "At step 5, count how many steps she re-studies. Why not all five?",
  ],
  limits:
    "One person, one topic, one round. Real gaps can take several rounds of recall, and some only show up on harder questions. The three days is this example's gap, not a rule: the best gap depends on how long you need to remember.",
};
