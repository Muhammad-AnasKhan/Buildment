import type { StateMachineSpec } from "../renderers/state-machine/types";

// Building Habits That Last course, chapter 3.2 "Places, times and people as
// cues". Khaled's evening after his 22:00 shift: a chain of context cues (the
// time, the action just finished, the sofa, his brother, the phone in hand)
// ends in scrolling until 00:30. Changing the first link (staying at the table
// with a book left open) changes the cue for the rest of the chain. See spec.md.
export const khaledEveningCues: StateMachineSpec = {
  kind: "state-machine",
  title: "Khaled's evening: a chain of cues",
  purpose: "Step through the cues that run Khaled's evening, then change one early link and watch the rest of the chain change with it.",
  summary:
    "At 22:00 Khaled closes the laptop, sits on the sofa where his brother is watching football, and the phone already in his hand leads to scrolling until 00:30. When he changes the first link and stays at the table, the book he left open there becomes the next cue, he studies for 20 minutes, and only then joins his brother.",
  states: [
    { id: "shift", name: "Shift ends", sub: "22:00, laptop shut", col: 0, row: 0 },
    { id: "sofa", name: "Sits on the sofa", sub: "brother, football", col: 1, row: 0 },
    { id: "phone", name: "Phone in hand", sub: "scrolls to 00:30", col: 2, row: 0 },
    { id: "table", name: "Stays at the table", sub: "lamp beside him", col: 0, row: 1 },
    { id: "book", name: "Book is open", sub: "at today's page", col: 1, row: 1 },
    { id: "study", name: "Studies 20 min", sub: "then the sofa", col: 2, row: 1 },
  ],
  edges: [
    { from: "shift", to: "sofa", label: "then" },
    { from: "sofa", to: "phone", label: "then" },
    { from: "shift", to: "table", label: "new" },
    { from: "table", to: "book", label: "then" },
    { from: "book", to: "study", label: "then" },
  ],
  steps: [
    {
      state: "shift",
      title: "The first cues: a time and an action",
      note: "At 22:00 Khaled closes the laptop. Two cues arrive together: the time, the end of his shift, and the action he just finished. His back is stiff, and the sofa is three steps away.",
      chips: ["time: 22:00", "action just finished: laptop shut"],
    },
    {
      state: "sofa",
      edge: 0,
      title: "A place and people",
      note: "He sits on the sofa, where his younger brother is watching a football match. Now the place and the people are cues too. Sitting down there is the cue for the next link.",
      chips: ["place: the sofa", "people: brother, the match"],
    },
    {
      state: "phone",
      edge: 1,
      tone: "bad",
      outcome: "00:30",
      title: "The phone is already in his hand",
      note: "He checked a work message a minute ago, so the phone needs no steps at all. He opens a video app 'just for a minute' and looks up at 00:30. He decided nothing: each link started the next one.",
      chips: ["object: phone in hand", "five cues, one direction"],
    },
    {
      state: "table",
      edge: 2,
      title: "Change the first link",
      note: "His new plan: 'When I close the laptop at 22:00, I stay at the table and open the book I left there.' He cannot change when the shift ends, but he can change where he goes in the first minute after it.",
      chips: ["if-then plan from module 2"],
    },
    {
      state: "book",
      edge: 3,
      title: "The new place brings a new cue",
      note: "Before his shift, he left the book open at today's page beside the laptop, with a small lamp he charges in the power hours. The open book is now the first thing he sees at 22:00, not the sofa.",
      chips: ["object: the open book", "lamp charged in power hours"],
    },
    {
      state: "study",
      edge: 4,
      tone: "good",
      outcome: "4 of 5",
      title: "The rest of the chain changes too",
      note: "He studies for 20 minutes, then joins his brother at 22:20. The sofa and the phone still come, but after the study. In his first week, in this example, he studied on 4 of his 5 work evenings.",
      chips: ["studied 4 of 5 evenings"],
    },
    {
      state: "sofa",
      tone: "warn",
      outcome: "old chain",
      title: "When the first link slips",
      note: "On the fifth evening a customer problem ran late and he closed the laptop at 22:40. Tired, he went straight to the sofa, and the old chain ran. His fix: 'If the shift runs late, I read one page, then stop.'",
    },
  ],
  tryThis: [
    "At step 4, before you go on, check the prediction you made above the canvas: which cues of the old chain will now never appear?",
    "At the last step, name the cue that pulled Khaled back into the old chain. Was it a place, a time, people or an action?",
  ],
  limits:
    "A real evening has more cues than six boxes can show, and a new chain does not work every night. People cues, such as a brother calling him to watch a match, can still pull him back, and an old chain can return when its first cue returns. The numbers belong to this example only.",
};
