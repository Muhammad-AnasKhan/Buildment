import type { StateMachineSpec } from "../renderers/state-machine/types";

// Founder Interview course, chapter 3.2 "How a why chain works and where it
// breaks". Iyad's resume line "Reduced app load time by 40 percent" is asked
// five whys and ends at a number he can source and an honest limit. Then two
// chains that break: one ends at blame, and Karam's checkout line breaks at the
// second why. The six states are the roles of the whys, so the same boxes can
// show a strong chain and a broken one. See spec.md.
export const resumeLineWhyChain: StateMachineSpec = {
  kind: "state-machine",
  title: "Five whys on one resume line",
  purpose: "Follow a founder's whys down one resume line to a fact the fellow checked, then see two chains that break.",
  summary:
    "Iyad's line says he reduced app load time by 40 percent. The whys go from the reason he started, to the cause he found by looking, to the options he weighed, to the number and its source, to an honest limit: the server also changed that month. A weaker chain ends at blame. Karam's chain on his checkout line breaks at the second why, because he never looked for a cause.",
  states: [
    { id: "line", name: "The resume line", sub: "load time 40%", col: 0, row: 0 },
    { id: "trigger", name: "Reason to start", sub: "slow phones", col: 1, row: 0 },
    { id: "cause", name: "Cause you found", sub: "big images", col: 2, row: 0 },
    { id: "options", name: "Options weighed", sub: "three options", col: 2, row: 1 },
    { id: "number", name: "Number and source", sub: "5 s to 3 s", col: 1, row: 1 },
    { id: "limit", name: "Honest limit", sub: "server changed", col: 0, row: 1 },
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
      note: "Iyad builds a shopping app for a small online store. His resume says: Reduced app load time by 40 percent. The founder asks: why did you work on load time?",
      chips: ["Reduced app load time by 40 percent"],
    },
    {
      state: "trigger",
      edge: 1,
      title: "Why 1: a real reason to start",
      note: "Users in the pilot were on slow phones, and the support inbox had several complaints a week about the app freezing on start. The reason has a source he can open. Next why: why was it slow?",
      chips: ["evidence: support inbox"],
    },
    {
      state: "cause",
      edge: 2,
      title: "Why 2: a cause found by looking",
      note: "The home screen loaded every product image at full size before it showed anything. He found this by looking at what the app loaded, not by guessing. Next why: why this fix and not another?",
      chips: ["found by looking"],
    },
    {
      state: "options",
      edge: 3,
      title: "Why 3: options and a trade-off",
      note: "He compared caching, smaller images and lazy loading. Smaller images were a one-day change. Caching needed backend work the team had no time for. This is a decision he made, with a reason.",
      chips: ["three options", "chose the one-day change"],
    },
    {
      state: "number",
      edge: 4,
      title: "Why 4: where the 40 percent comes from",
      note: "He timed start-up on the cheapest test phone, ten runs before and ten after: about 5 seconds to about 3 seconds. Two seconds out of five is 40 percent.",
      chips: ["10 runs before", "10 runs after", "cheapest test phone"],
    },
    {
      state: "limit",
      tone: "good",
      outcome: "ends at a fact",
      title: "Why 5: how much was his",
      note: "Complaints about freezing stopped in the next two weeks. But the server also changed that month, so he says he cannot claim it was only his change. The chain ends at a fact he checked and an honest limit.",
      chips: ["a stop point", "no guess needed"],
    },
    {
      state: "cause",
      tone: "bad",
      outcome: "ends at blame",
      title: "A chain that ends at blame",
      note: "Another developer is asked why the app was slow. She says: because the server team is slow. The chain ends at other people. There is nothing she decided and nothing she checked, so the next why has no answer.",
    },
    {
      state: "cause",
      tone: "bad",
      outcome: "breaks at why 2",
      title: "Karam's chain breaks at the second why",
      note: "Karam's line says he led the checkout redesign. Why 1: to reduce friction. Why 2: what friction did you find? He did not look for any. His first reason was a guess that sounded right, and the chain has nothing under it.",
      chips: ["a reason he cannot support"],
    },
  ],
  tryThis: [
    "Before step 6, say where you think Iyad's chain will stop. Then check: does it stop at a decision he made or a fact he checked?",
    "At step 8, ask what Karam could say instead at why 2. Think of one honest sentence that starts with 'At the time, I...'.",
  ],
  limits:
    "A why chain finds one path, and real problems have more than one cause: Iyad's slow start-up could also have had a server part. Five is a habit, not a rule, so stop at a decision you made or a fact you checked. No study has tested the five whys as an interview method; founders use the habit, and you can use it to check your own lines.",
};
