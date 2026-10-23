import type { StateMachineSpec } from "../renderers/state-machine/types";

// Steady Hearts course (faith-and-resilience), chapter 7.3 "Caring for body and
// mind, and asking for help". Yasmin has carried three heavy weeks alone. The
// canvas follows the road where she tells nobody and the road where she tells
// a real person, her mentor and a doctor. It models her steps only; it never
// diagnoses and says nothing about medication. See spec.md.
export const whoToTell: StateMachineSpec = {
  kind: "state-machine",
  title: "Who to tell when it gets heavy",
  purpose: "See that when you are overwhelmed, the next step is a real person: someone you trust, your mentor or coordinator, and a doctor or counsellor.",
  summary:
    "After three heavy weeks, Yasmin can tell nobody, and carrying it alone makes it heavier. Or she can tell her friend Mariam, then her mentor, who helps her cut her load and asks about a doctor. The doctor checks her and suggests a counsellor, and she ends with a plan that has rest, treatment and her prayers in it.",
  states: [
    { id: "heavy", name: "Heavy for weeks", sub: "tell anyone?", col: 0, row: 0 },
    { id: "trust", name: "Someone you trust", sub: "a friend, family", col: 1, row: 0 },
    { id: "mentor", name: "Your mentor", sub: "or the coordinator", col: 2, row: 0 },
    { id: "pro", name: "Doctor, counsellor", sub: "treatment", col: 2, row: 1 },
    { id: "plan", name: "A plan with care", sub: "rest, treat, pray", col: 1, row: 1 },
    { id: "alone", name: "Carry it alone", sub: "it gets heavier", col: 0, row: 1 },
  ],
  edges: [
    { from: "heavy", to: "trust", label: "yes" },
    { from: "heavy", to: "alone", label: "no" },
    { from: "trust", to: "mentor", label: "also tell" },
    { from: "mentor", to: "pro", label: "yes" },
    { from: "pro", to: "plan", label: "plan care" },
  ],
  steps: [
    {
      state: "heavy",
      title: "Three heavy weeks",
      note: "Yasmin has slept four or five hours a night for three weeks. She lies awake even when she has time to sleep, worries most of the day, and finds small tasks very heavy. She has stopped joining the Saturday call. The question is: will she tell anyone?",
      chips: ["poor sleep", "worry all day", "tasks feel heavy", "pulling away"],
    },
    {
      state: "alone",
      edge: 1,
      tone: "bad",
      outcome: "heavier",
      title: "If she tells nobody",
      note: "She tells herself that others have real problems and that she must try harder. Nobody can help with what nobody knows. The weeks stay heavy, and she has to carry them alone. Sabr is not silence.",
    },
    {
      state: "trust",
      edge: 0,
      tone: "good",
      outcome: "first step",
      title: "She tells someone she trusts",
      note: "She sends her friend Mariam a voice message: she has not been well for three weeks. Mariam calls back the same evening, listens first, and reminds her she is allowed to be tired. When the Prophet, peace be upon him, was afraid, he told Khadijah (Sahih al-Bukhari 3).",
      chips: ["Sahih al-Bukhari 3"],
    },
    {
      state: "mentor",
      edge: 2,
      title: "She tells her mentor",
      note: "Mariam encourages her to tell Reem, her mentor. Reem thanks her, helps her decide which favours to put down for now, and asks whether she has seen a doctor, because the sleep problem has lasted weeks. For you, this is your mentor or the fellowship coordinator.",
      chips: ["your mentor", "or the fellowship coordinator"],
    },
    {
      state: "pro",
      edge: 3,
      title: "A doctor, then a counsellor",
      note: "Yasmin sees a doctor at a clinic near her home. The doctor checks her, asks about her sleep and her worries, and suggests she also talk to a counsellor at a community centre. Seeking treatment is taking the means (Jami' at-Tirmidhi 2038, graded sahih).",
      chips: ["Jami' at-Tirmidhi 2038", "Sahih al-Bukhari 5678"],
    },
    {
      state: "plan",
      edge: 4,
      tone: "good",
      outcome: "next step",
      title: "A plan with care in it",
      note: "She works from 20:00 to midnight while the power is on and sleeps from about 00:30 to 07:30. She keeps one small act of service and drops the rest for a month. She keeps her prayers and her dua, books the counsellor, and will tell Reem next Saturday how the week went.",
      chips: ["about 7 hours of sleep", "check in on Saturday"],
    },
    {
      state: "trust",
      tone: "good",
      outcome: "still open",
      title: "It is never too late to tell",
      note: "If you have already carried something alone for a long time, the road back is the same first step: tell one real person today. You do not need the right words. 'I have not been well for a while' is enough to begin.",
    },
  ],
  tryThis: [
    "Before step 3, check your prediction: what should Yasmin's first step be?",
    "At step 5, notice that the mentor does not replace the doctor, and the doctor does not replace prayer. Who does what in Yasmin's plan?",
  ],
  limits:
    "This is one order that often works; some people tell their mentor first, and that is fine. The canvas does not diagnose anything or say what treatment anyone needs: only a doctor or counsellor can do that. If you feel overwhelmed for a long time, or you have thoughts of harming yourself, talk to your mentor or the fellowship coordinator today, and to a doctor or counsellor if you can. This course does not replace professional care.",
};
