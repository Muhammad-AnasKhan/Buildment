import type { SequenceSpec } from "../renderers/sequence/types";

// The Founder Interview course, chapter 5.7 "A demo they can open".
// A founder has ten minutes between calls. Rana's first link leads to a
// sign-up form with an email confirmation, and the founder leaves. Her second
// link opens a guest login with made-up sample data, and the founder reaches
// the core flow in under two minutes. The numbers belong to this example.
// See spec.md.
export const demoTheyCanOpen: SequenceSpec = {
  kind: "sequence",
  title: "Two links to the same carpool app",
  purpose: "See how a sign-up wall loses a busy founder, and how a guest login with sample data lets the same founder see the core flow in two minutes.",
  summary:
    "A founder has ten minutes and opens Rana's link. The first link leads to a sign-up form and an email confirmation, and the founder leaves. The second link has a guest button and made-up sample data, so the founder books a ride and sees the driver side in under two minutes, then reads a short page that lists what is not done.",
  actors: [
    { name: "Founder", sub: "ten minutes" },
    { name: "Your link", sub: "what they open" },
    { name: "Your app", sub: "carpool demo" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "opens the link",
      title: "The first try: the link",
      note: "A founder has ten minutes between calls. Rana's message says: my carpool app is here, with a link. The founder opens it on a phone. Before you press Next: what does she hope to see first?",
    },
    {
      from: 1,
      to: 2,
      label: "sign-up form",
      tone: "warn",
      title: "The first screen",
      note: "The link goes straight to the app, and the first screen asks for an email and a password. Before you press Next: what will the founder do?",
    },
    {
      from: 2,
      to: 0,
      label: "confirm by email",
      tone: "bad",
      outcome: "founder leaves",
      title: "The wall",
      note: "The app says: Check your email to confirm. The email takes a minute, and she has nine minutes left. She closes the tab and goes to her next call. Before you press Next: how would you rebuild the first click?",
    },
    {
      from: 0,
      to: 1,
      label: "opens the link",
      title: "The second try: the link",
      note: "Now Rana's second message. The new link opens a short page with two lines about the app, a Try as a guest button, and a link to a two-minute recording. Before you press Next: what happens after one click?",
    },
    {
      from: 1,
      to: 2,
      label: "guest login",
      tone: "good",
      title: "One click",
      note: "The guest button opens the app with a demo account. The app already holds made-up sample data: 12 rides, 4 drivers and 3 riders. Before you press Next: what should the founder be able to do in two minutes?",
    },
    {
      from: 2,
      to: 0,
      label: "core flow, 2 min",
      tone: "good",
      outcome: "founder sees it",
      title: "The core flow",
      note: "The founder searches for a ride, books a seat, and switches to the driver view to see the booking. One login shows both sides. It takes under two minutes. Before you press Next: what will she want to know next?",
    },
    {
      from: 0,
      to: 1,
      label: "what is not done?",
      title: "The short page",
      note: "The founder goes back and opens the short page under the Try as a guest button. Before you press Next: what should it say about what is missing?",
    },
    {
      from: 1,
      to: 0,
      label: "page with gaps",
      tone: "good",
      outcome: "an honest list",
      title: "What is done, and what is not",
      note: "The page says what the app does, what Rana built, two key choices, and what is not done: payments and notifications. It names the first thing she would check if ten times more students came. No keys and no real user data appear anywhere in the demo.",
    },
  ],
  tryThis: [
    "At step 3, write down the first click of your own project. How many steps stand between a stranger and the core flow?",
    "At step 5, ask who your two kinds of users are. Could one demo login show both sides?",
  ],
  limits:
    "This is one founder, one app and one ten-minute window, with numbers that belong to this example. Some founders will read code, and some projects cannot be hosted for free or on a weak connection. In that case a short screen recording and screenshots are the next best thing. A demo does not replace the interview. It gives the founder something true to ask about.",
};
