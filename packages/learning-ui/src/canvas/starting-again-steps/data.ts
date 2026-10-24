import type { StateMachineSpec } from "../renderers/state-machine/types";

// Steady Hearts course (faith-and-resilience), chapter 6.4 "After a failure".
// Tariq's steps after delivering nine days late without a message and losing
// the client: name it honestly (a lost client is not a sin; the silence was a
// wrong), put it right with the client, learn so it does not happen twice
// (Sahih al-Bukhari 6133), turn back to Allah where he did wrong (Quran 7:23,
// 3:135, Sahih Muslim 2749), and start again. "If only" is drawn as a refused
// move that leaves him where he was (Sahih Muslim 2664). See spec.md.
export const startingAgainSteps: StateMachineSpec = {
  kind: "state-machine",
  title: "Starting again, one step at a time",
  purpose: "Follow Tariq from a lost client to a fresh start, and see why 'if only' leads nowhere.",
  summary:
    "After a setback, Tariq names what happened honestly, keeping the lost client (not a sin) apart from his silence (a wrong). He puts it right with the client, learns what to change so it does not happen twice, turns back to Allah for the wrong he did, and starts again the next morning. Saying 'if only' leaves him stuck where he started.",
  states: [
    { id: "setback", name: "Setback", sub: "nine days late", col: 0, row: 0 },
    { id: "name", name: "Name it", sub: "honestly", col: 1, row: 0 },
    { id: "putright", name: "Put it right", sub: "with the client", col: 2, row: 0 },
    { id: "learn", name: "Learn", sub: "change the cause", col: 2, row: 1 },
    { id: "turnback", name: "Turn back", sub: "to Allah", col: 1, row: 1 },
    { id: "start", name: "Start again", sub: "next morning", col: 0, row: 1 },
  ],
  edges: [
    { from: "setback", to: "name", label: "be honest" },
    { from: "name", to: "putright", label: "go to client" },
    { from: "putright", to: "learn", label: "and" },
    { from: "learn", to: "turnback", label: "where wrong" },
    { from: "turnback", to: "start", label: "try again" },
    { from: "setback", to: "setback", label: "if only...", kind: "rejected" },
  ],
  steps: [
    {
      state: "setback",
      title: "The setback",
      note: "Tariq delivered the travel agency's booking site nine days late, with two bugs, and without a message while he was late. The owner did not pay the second $600 and ended the contract.",
      chips: ["9 days late", "no message", "client lost"],
    },
    {
      state: "setback",
      edge: 5,
      tone: "bad",
      outcome: "stuck",
      title: "'If only' goes round in a circle",
      note: "'If only I had said no to the third project. If only I had slept more.' Every turn of 'if only' ends where it began. The Prophet, peace be upon him, taught: do not say 'if only', but say 'Allah decreed, and He did what He willed', for 'if only' opens the door to Satan's work (Sahih Muslim 2664).",
    },
    {
      state: "name",
      edge: 0,
      title: "Name it honestly, and keep two things apart",
      note: "Losing a client is not a sin; clients come and go. But staying silent while he knew he was late was a wrong to the client. The Quran teaches the plain words of Adam and Hawwa, peace be upon them, meaning: our Lord, we have wronged ourselves (Quran 7:23).",
      chips: ["lost client: a setback", "silence: a wrong"],
    },
    {
      state: "putright",
      edge: 1,
      title: "Put right what you can, with the person",
      note: "He writes to the owner: no excuses, an apology for the silence, and an offer to send the fix for the two bugs to the new developer, free. The owner thanks him and accepts the fix.",
      tone: "good",
      outcome: "message sent",
    },
    {
      state: "learn",
      edge: 2,
      title: "Learn so it does not happen twice",
      note: "A believer is not stung from the same hole twice (Sahih al-Bukhari 6133). He changes the causes: at most two projects at once, three spare days in every estimate, and a message to the client on the first day he sees a delay.",
      chips: ["two projects at most", "3 spare days", "tell on day one"],
    },
    {
      state: "turnback",
      edge: 3,
      title: "Turn back to Allah where you did wrong",
      note: "For the silence, he asks Allah's forgiveness and resolves not to repeat it: those who do wrong, remember Allah, ask forgiveness and do not knowingly persist (Quran 3:135). People who err and turn back are what Allah expects of humans (Sahih Muslim 2749); that is not a reason to do wrong; it shows that forgiveness is always open to those who turn back.",
    },
    {
      state: "start",
      edge: 4,
      tone: "good",
      outcome: "started",
      title: "Start again",
      note: "The next morning he reads his intention line (chapter 6.2), does his 45 minutes of testing practice (chapter 6.3), and writes to the language school with an honest date. The failure is behind him; the lessons go with him.",
    },
  ],
  tryThis: [
    "Before you start, predict: does saying 'if only' again and again help Tariq avoid the same mistake?",
    "At step 2, count how many steps 'if only' moves Tariq forward.",
    "At step 5, find the three changes. Which one would have saved the client last month?",
  ],
  limits:
    "Real starting again is rarely this tidy, and some steps take days, not minutes. Not every setback includes a wrong: a failed exam after honest study needs learning and a new start, not repentance. The canvas shows one order that the sources support; it does not measure sin, forgiveness or reward, which belong to Allah.",
};
