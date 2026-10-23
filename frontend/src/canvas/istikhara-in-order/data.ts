import type { StateMachineSpec } from "../renderers/state-machine/types";

// Steady Hearts course (faith-and-resilience), chapter 5.4 "Istikhara: ask
// Allah to choose for you". The order the course teaches for a decision:
// options checked as allowed, facts gathered, people consulted, then
// istikhara (Sahih al-Bukhari 1166), then decide, act and watch whether the
// way opens. Two refused moves: istikhara about something not allowed, and
// waiting for a dream. Only the agreed core is stated as fact; the weight of
// a feeling afterwards is left to "scholars differ". See spec.md.
export const istikharaInOrder: StateMachineSpec = {
  kind: "state-machine",
  title: "Istikhara in its place",
  purpose: "Follow Rania's decision from allowed options to acting on it, and see what istikhara does and does not need.",
  summary:
    "Rania checks that both options are allowed, gathers the facts and consults people. Then she prays two rak'as that are not obligatory and says the istikhara dua. Then she goes ahead with what seems best, acts, and watches whether the way opens. Istikhara is not made about something that is not allowed, and it does not need a dream.",
  states: [
    { id: "allowed", name: "Options allowed", sub: "checked first", col: 0, row: 0 },
    { id: "ready", name: "Facts and advice", sub: "chapters 5.2, 5.3", col: 1, row: 0 },
    { id: "istikhara", name: "Istikhara", sub: "two rak'as, the dua", col: 2, row: 0 },
    { id: "decide", name: "Decide and act", sub: "what seems best", col: 2, row: 1 },
    { id: "watch", name: "Watch the way", sub: "does it open?", col: 1, row: 1 },
  ],
  edges: [
    { from: "allowed", to: "ready", label: "yes" },
    { from: "ready", to: "istikhara", label: "then pray" },
    { from: "istikhara", to: "decide", label: "go" },
    { from: "decide", to: "watch", label: "act" },
    { from: "allowed", to: "allowed", label: "not allowed", kind: "rejected" },
    { from: "istikhara", to: "istikhara", label: "wait for dream", kind: "rejected" },
  ],
  steps: [
    {
      state: "allowed",
      title: "Start: is each option allowed?",
      note: "Istikhara is for choosing between things that are allowed, such as two job offers. Both of Rania's offers are ordinary data work. If you are unsure whether an option is allowed, ask a scholar you trust first.",
      chips: ["NGO job: allowed", "startup contract: allowed"],
    },
    {
      state: "allowed",
      edge: 4,
      tone: "bad",
      outcome: "not for this",
      title: "Not for what is wrong, or a clear duty",
      note: "You do not make istikhara about whether to pray, or whether to do something wrong. The question there is already answered. Istikhara is for a choice between allowed things.",
    },
    {
      state: "ready",
      edge: 0,
      title: "Take the means of knowing",
      note: "Rania gathered the missing facts and named what matters most to her: a steady income for her family against learning for her career (chapter 5.2).",
      chips: ["renewal: funding in month four", "must-have: 1,500 shekels"],
    },
    {
      state: "ready",
      title: "Ask people who know",
      note: "She asked her mother about the family, Reem about her career, and Samah and Jumana about the work. The offers are now almost level: 39 points to 38 (chapter 5.3).",
    },
    {
      state: "istikhara",
      edge: 1,
      title: "Pray istikhara",
      note: "On Monday night she prays two rak'as that are not obligatory, then says the dua the Prophet, peace be upon him, taught, naming the matter: the six-month contract with the startup (Sahih al-Bukhari 1166).",
      chips: ["two rak'as, not obligatory", "then the dua", "name the matter"],
    },
    {
      state: "istikhara",
      edge: 5,
      tone: "bad",
      outcome: "not needed",
      title: "No dream is needed",
      note: "Rania sleeps, and she does not dream about either job. Nothing is missing. The hadith has no dream in it, and no sound text requires a dream or a sign. She does not wait.",
    },
    {
      state: "decide",
      edge: 2,
      title: "Go ahead with what seems best",
      note: "On Tuesday she reads her notes again. With savings and the NGO's door left open as a backup, the startup's weak point is less weak. She accepts the startup contract and asks for the 18:00 calls in writing.",
      chips: ["save 500 shekels a month", "Muath helps Jana"],
    },
    {
      state: "watch",
      edge: 3,
      tone: "good",
      outcome: "the way opened",
      title: "Watch whether the way opens, and trust Allah",
      note: "By Wednesday the startup agrees to the call times and sends the contract, and the steps are easy. Scholars differ on how much weight to give a feeling in the heart; ask a scholar you trust. You may repeat istikhara. Once you have decided, put your trust in Allah (Quran 3:159).",
    },
  ],
  tryThis: [
    "Before you start, predict: once Rania prays istikhara, does she still need the facts and the people she asked?",
    "At step 6, notice what Rania does when no dream comes. What would have happened to her two deadlines if she had waited for one?",
    "At step 7, find what made Rania comfortable with the startup's weak point. Which earlier step gave her that idea?",
  ],
  limits:
    "This is the order the course teaches, built on the hadith and on the points every source checked agrees on: istikhara is for allowed choices, no dream is required, and you study the matter and consult as well. Scholars differ on details, such as how much weight a feeling carries afterwards; ask a scholar you trust. The canvas does not measure the answer to a prayer, and the way opening for Rania is her story, not a promise about anyone's outcome.",
};
