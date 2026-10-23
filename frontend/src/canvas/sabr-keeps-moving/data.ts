import type { StateMachineSpec } from "../renderers/state-machine/types";

// Steady Hearts course (faith-and-resilience), chapter 3.2 "What sabr is, and
// what it is not". Mariam's first days after a scholarship rejection: tears at
// the first shock, right words, asking for help and a small step are all inside
// sabr, and when sadness returns she steadies herself again; hiding and
// stopping is the road that leaves it. See spec.md.
export const sabrKeepsMoving: StateMachineSpec = {
  kind: "state-machine",
  title: "Sabr keeps moving",
  purpose: "Follow Mariam from the rejection email to her first small step, and see which road is sabr and which is not.",
  summary:
    "After the rejection email, Mariam meets the first shock with tears, holds steady with right words and nothing against Allah, asks her mother and her mentor for help, and takes a small next step; when sadness returns, she steadies herself again. The other road from the first shock, hiding it and stopping, is giving up, not sabr.",
  states: [
    { id: "shock", name: "First shock", sub: "tears are allowed", col: 0, row: 0 },
    { id: "words", name: "Right words", sub: "nothing against Allah", col: 1, row: 0 },
    { id: "help", name: "Ask for help", sub: "mother and mentor", col: 2, row: 0 },
    { id: "giveup", name: "Give up", sub: "hide it and stop", col: 0, row: 1 },
    { id: "again", name: "Sad day again", sub: "a friend's news", col: 1, row: 1 },
    { id: "step", name: "A small step", sub: "back to lessons", col: 2, row: 1 },
  ],
  edges: [
    { from: "shock", to: "words", label: "hold steady" },
    { from: "words", to: "help", label: "ask" },
    { from: "help", to: "step", label: "so" },
    { from: "step", to: "again", label: "it returns" },
    { from: "again", to: "words", label: "and" },
    { from: "shock", to: "giveup", label: "or" },
  ],
  steps: [
    {
      state: "shock",
      title: "The first shock",
      note: "After a year of work, Mariam reads a four-line email: the scholarship committee cannot offer her a place this year. She cries, and her mother sits beside her. Patience is at the first shock (Sahih al-Bukhari 1283). That does not mean no tears: the Prophet's eyes filled with tears at his son's death, and he called it mercy (Sahih al-Bukhari 1303).",
      chips: ["tears are human", "Sahih al-Bukhari 1283"],
    },
    {
      state: "words",
      edge: 0,
      title: "Hold steady with the tongue",
      note: "She says the istirja with her mother: we belong to Allah and to Him we return. She says nothing against Allah. This is already sabr, on the first evening, with tears on her face.",
      chips: ["inna lillahi", "no words against Allah"],
    },
    {
      state: "help",
      edge: 1,
      title: "Ask for help",
      note: "For three days she cancelled her lessons and told everyone 'I am being patient'. Then she tells her mother the truth and writes to her mentor, Reem: 'I am sad, and I have stopped my lessons. Can we talk on Saturday?' Allah tells believers to seek help through patience and prayer (Quran 2:153).",
      chips: ["Quran 2:153", "seeking help is part of sabr"],
    },
    {
      state: "step",
      edge: 2,
      tone: "good",
      outcome: "sabr keeps moving",
      title: "A small next step",
      note: "She restarts her three students' lessons next week, and emails the scholarship office to ask whether feedback is available.",
      chips: ["three students", "asks for feedback"],
    },
    {
      state: "again",
      edge: 3,
      tone: "warn",
      outcome: "it comes back",
      title: "A sad day returns",
      note: "On Thursday a friend posts about her own scholarship, and the sadness comes back. This does not mean Mariam's sabr has failed. Sadness does not leave in a straight line.",
    },
    {
      state: "words",
      edge: 4,
      title: "Steady again",
      note: "She cries a little, makes dua, and teaches her evening lesson. Sabr is not a feeling that stays. It is what she does each time the feeling returns. Whoever tries to be patient, Allah makes him patient (Sahih al-Bukhari 1469).",
      chips: ["Sahih al-Bukhari 1469"],
    },
    {
      state: "giveup",
      edge: 5,
      tone: "bad",
      outcome: "not sabr",
      title: "The other road",
      note: "If Mariam had kept hiding it, cancelled every lesson and decided never to apply again, that would not be sabr. Silence and giving up can look calm from outside, but they stop the person.",
    },
    {
      state: "step",
      tone: "good",
      outcome: "what sabr is",
      title: "Sabr is steadiness that keeps acting",
      note: "Tears, right words, asking for help and steadying yourself again are all inside sabr. Giving up is the only road on this map that leaves sabr behind.",
    },
  ],
  tryThis: [
    "At step 3, check the prediction you made above the canvas: is asking for help still sabr?",
    "Compare step 4 with step 7. Both can look calm from outside. What is the difference you could see in a week?",
  ],
  limits:
    "This is one person's first days after one loss, drawn as a simple map. Real grief does not move in a straight line: sad days come back, and a person may move between these states many times. The canvas shows what sabr includes and excludes; it does not measure anyone's faith or patience.",
};
