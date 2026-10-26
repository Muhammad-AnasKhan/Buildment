import type { StateMachineSpec } from "../renderers/state-machine/types";

// The Founder Interview course, chapter 6.2 "Strengths with evidence".
// Nour moves from a broad strength nobody can check to a narrow one with a
// recent example and a fact someone else saw. Facts match the chapter and the
// course cast. See spec.md.
export const broadToNarrowStrength: StateMachineSpec = {
  kind: "state-machine",
  title: "Nour's strength: from broad to checkable",
  purpose: "Follow one strength from a claim nobody can check to a claim with an example and a witness.",
  summary:
    "Nour starts with I am a good designer, which has nothing to check. She narrows it to client work, then to one skill: turning messy client feedback into one clear list of changes. She adds a recent example and what clients said, and she ends with a short claim an interviewer can check.",
  states: [
    { id: "broad", name: "Broad claim", sub: "good designer", col: 0, row: 0 },
    { id: "wider", name: "Still too wide", sub: "good with clients", col: 1, row: 0 },
    { id: "narrow", name: "Narrow strength", sub: "one clear skill", col: 2, row: 0 },
    { id: "recent", name: "Recent example", sub: "one real time", col: 2, row: 1 },
    { id: "seen", name: "Seen by others", sub: "what they said", col: 1, row: 1 },
    { id: "ready", name: "Ready to say", sub: "short, checkable", col: 0, row: 1 },
  ],
  edges: [
    { from: "broad", to: "wider", label: "which part?" },
    { from: "wider", to: "narrow", label: "what exactly?" },
    { from: "narrow", to: "recent", label: "and" },
    { from: "recent", to: "seen", label: "who saw it?" },
    { from: "seen", to: "ready", label: "say it" },
  ],
  steps: [
    {
      state: "broad",
      edge: 0,
      title: "The broad claim",
      note: "Nour says: I am a good designer. The hiring manager asks: How do you know? She has nothing to point at. Every designer could say this, so it tells the manager nothing. Before you press Next: which part of design is Nour best at?",
      tone: "bad",
      outcome: "cannot be checked",
    },
    {
      state: "wider",
      edge: 1,
      title: "Narrower, but still wide",
      note: "She tries: I am good with clients. Better, because it names a kind of work. But what does she do well with clients? The manager still cannot check it. Before you press Next: what exactly does she do well with clients?",
      chips: ["a kind of work", "no skill yet"],
    },
    {
      state: "narrow",
      edge: 2,
      title: "One skill you can check",
      note: "I turn messy client feedback into one clear list of changes. Now there is a thing she does, with a start and an end. Someone can look at one of her lists and judge it. Before you press Next: what recent time could she use as an example?",
      tone: "good",
      outcome: "narrow and checkable",
    },
    {
      state: "recent",
      edge: 3,
      title: "A recent example",
      note: "Last month one client sent 14 comments in three emails and a voice note. I grouped them into 5 changes and put them in the order the client wanted. One time, one client, one result. Before you press Next: what could another person say or have seen?",
      chips: ["one time", "numbers from the case"],
    },
    {
      state: "seen",
      edge: 4,
      title: "What someone else saw",
      note: "Three clients came back for more work. One wrote that my summaries saved them a meeting. A person can check these facts, and they are not Nour's opinion of herself. Before you press Next: how would you say all of this in two sentences?",
      chips: ["3 clients returned", "a client's own words"],
    },
    {
      state: "ready",
      tone: "good",
      outcome: "ready to say",
      title: "The sentence she says",
      note: "I turn messy client feedback into one clear list of changes. Last month it was 14 comments into 5 changes, and a client wrote that it saved them a meeting. Three clients have come back for more work. What would you say if no client had written anything yet?",
    },
    {
      state: "seen",
      tone: "warn",
      outcome: "an honest gap",
      title: "When no one has said it yet",
      note: "If no one has said anything yet, say so: No client has put it in writing yet, and I will ask the next one for a sentence. That is better than a quote you invented.",
    },
  ],
  tryThis: [
    "Write your own broad strength on a line. Then ask which part, and what exactly, until it is one skill someone could check.",
    "At the last step, why is an honest gap better than a quote you cannot show?",
  ],
  limits:
    "Research finds that people judge themselves more accurately on narrow, specific skills than on broad ones. It does not say that every narrow claim is true: you still need an example and a witness. The numbers belong to this example. Some strengths, such as staying calm, are hard to narrow, and a short example can still carry them.",
};
