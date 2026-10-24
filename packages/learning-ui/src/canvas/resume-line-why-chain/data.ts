import type { StateMachineSpec } from "../renderers/state-machine/types";

// Founder Interview course, chapter 3.2 "How a why chain works and where it
// breaks". Iyad's resume line "Reduced app load time by 40 percent" (a bus
// times app for a small city) is asked five whys and ends at a number he can
// source and an honest limit. Then two chains that fail: one ends at blame,
// and Karam's checkout line fails at the second why. The six states are the
// roles of the whys, so the same boxes can show a strong chain and a weak one.
// Each note ends with a short question that the next step answers. See spec.md.
export const resumeLineWhyChain: StateMachineSpec = {
  kind: "state-machine",
  title: "Five whys on one resume line",
  purpose: "Follow a founder's whys down one resume line to a fact the fellow checked, then see two chains that fail.",
  summary:
    "Iyad's line says he reduced the load time of a bus times app by 40 percent. The whys go from the reason he started, to the cause he found by looking, to the options he weighed, to the number and its source, to an honest limit: the app also moved to a faster host that month. A weaker chain ends at blame. Karam's chain on his checkout line fails at the second why, because he never looked for a cause.",
  states: [
    { id: "line", name: "The resume line", sub: "load time 40%", col: 0, row: 0 },
    { id: "trigger", name: "Reason to start", sub: "slow phones", col: 1, row: 0 },
    { id: "cause", name: "Cause you found", sub: "full route list", col: 2, row: 0 },
    { id: "options", name: "Options weighed", sub: "three options", col: 2, row: 1 },
    { id: "number", name: "Number and source", sub: "10 s to 6 s", col: 1, row: 1 },
    { id: "limit", name: "Honest limit", sub: "new host too", col: 0, row: 1 },
  ],
  edges: [
    { from: "line", to: "trigger", label: "why" },
    { from: "trigger", to: "cause", label: "why" },
    { from: "cause", to: "options", label: "why" },
    { from: "options", to: "number", label: "why" },
    { from: "number", to: "limit", label: "why" },
  ],
  steps: [
    {
      state: "line",
      edge: 0,
      title: "The line, and the first why",
      note: "Iyad builds a bus times app for a small city. His resume says: Reduced app load time by 40 percent. The founder asks: why did you work on load time? Before you press Next: what real reason could Iyad point to?",
      chips: ["Reduced app load time by 40 percent"],
    },
    {
      state: "trigger",
      edge: 1,
      title: "Why 1: a real reason to start",
      note: "Early users were on slow phones, and the support inbox had several messages a week saying the app froze when it opened. He can open the inbox and show them. Before you press Next: how could he find out why it was slow without guessing?",
      chips: ["evidence: support inbox"],
    },
    {
      state: "cause",
      edge: 2,
      title: "Why 2: a cause found by looking",
      note: "The home screen loaded the full list of 300 bus routes before it showed anything. He found this by watching what the app loaded, not by guessing. Before you press Next: he had more than one way to fix it. What would you ask about his choice?",
      chips: ["found by looking"],
    },
    {
      state: "options",
      edge: 3,
      title: "Why 3: options and a trade-off",
      note: "He compared saving the list on the phone, loading only the routes near the user, and showing the screen first. Loading nearby routes was a one-day change. Saving the list needed backend work the team had no time for. This is a decision he made. Before you press Next: what would you ask about the 40 percent?",
      chips: ["three options", "chose the one-day change"],
    },
    {
      state: "number",
      edge: 4,
      title: "Why 4: where the 40 percent comes from",
      note: "He opened the app ten times on the cheapest test phone before the change and ten times after. Each time he put the ten times in order and took the middle one: about 10 seconds before and about 6 seconds after. Four seconds out of ten is 40 percent. Before you press Next: could anything else have stopped the freezing messages?",
      chips: ["10 runs before", "10 runs after", "cheapest test phone"],
    },
    {
      state: "limit",
      tone: "good",
      outcome: "ends at a fact",
      title: "Why 5: how much was his",
      note: "The freezing messages stopped in the next two weeks. But the app also moved to a faster host that month, so he says he cannot claim it was only his change. The chain ends at a fact he checked and an honest limit. Before you press Next: where could a chain end that gives the founder nothing to check?",
      chips: ["a stop point", "no guess needed"],
    },
    {
      state: "cause",
      tone: "bad",
      outcome: "ends at blame",
      title: "A chain that ends at blame",
      note: "Another developer is asked why her app was slow. She says: because the other team's server is slow. The chain ends at other people. She decided nothing and checked nothing, so the next why has no answer. Before you press Next: Karam's line gets the same whys. Which one do you think stops him?",
    },
    {
      state: "cause",
      tone: "bad",
      outcome: "fails at why 2",
      title: "Karam's chain fails at the second why",
      note: "Karam's line says he led the checkout redesign. Why 1: to reduce friction (to make buying easier). Why 2: what friction did you find? He did not look for any. His first reason was a guess that sounded right, and nothing is under it.",
      chips: ["a reason he cannot support"],
    },
  ],
  tryThis: [
    "Before step 6, say where you think Iyad's chain will stop. Then check: does it stop at a decision he made or a fact he checked?",
    "At step 8, think what Karam could say instead at why 2. Find one honest sentence that starts with 'At the time, I...'.",
  ],
  limits:
    "A why chain finds one path, and real problems have more than one cause: Iyad's slow start-up could also have had a server part. Five is a habit, not a rule, so stop at a decision you made or a fact you checked. We did not find a study that tested the five whys as an interview method; founders use the habit, and you can use it to check your own lines.",
};
