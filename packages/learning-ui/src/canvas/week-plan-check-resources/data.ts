import type { SequenceSpec } from "../renderers/sequence/types";

// Learn and Build with AI course, chapter 5.3 "A weekly plan, one area at a
// time". Yara plans her caching week for Qasir: she asks a chat assistant for
// resources, checks that each one exists and is current (one book does not
// exist), replaces it with official docs she found herself, and writes the
// week. See spec.md.
export const weekPlanCheckResources: SequenceSpec = {
  kind: "sequence",
  title: "Yara's caching week: ask, check, then plan",
  purpose: "See how an AI's list of resources becomes a week plan only after each item is checked, and what the check catches.",
  summary:
    "Yara asks a chat assistant for three videos, one book chapter and two articles on caching, giving her level, time and data limits. She opens the three videos, which exist, though one is nine years old. She searches the book's author and finds a real writer. She then searches the title in a library catalogue, on the publisher's website and in two bookshops, and finds the book does not exist. She opens both articles, which exist, and replaces the book with the official docs she found herself. She writes the week plan with an 'I checked it exists' column, and ends the week with a recall test.",
  actors: [
    { name: "Yara", sub: "you" },
    { name: "Chat assistant", sub: "suggests" },
    { name: "Sources", sub: "library, web" },
    { name: "Her plan", sub: "week 7" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "ask what to learn",
      title: "Ask with your context",
      note: "Yara asks for three short videos, one book chapter and two articles on caching. She says she is a beginner, has about 8 hours this week, reads on a phone and has little data, and asks it to say if it is not sure something exists.",
      chips: ["caching", "beginner", "8 hours", "little data"],
    },
    {
      from: 1,
      to: 0,
      label: "six suggestions",
      outcome: "6 items",
      title: "The answer arrives in seconds",
      note: "Three videos, one book chapter and two articles, each with a title, an author or channel, a year and a reason. Every item looks equally real. None of them is checked yet.",
    },
    {
      from: 0,
      to: 2,
      label: "open the videos",
      tone: "good",
      outcome: "3 of 3 real",
      title: "Check 1: the videos",
      note: "She opens each video and checks the title, the channel, the date and the length. All three exist. One was posted nine years ago: its ideas still hold, but she marks its commands to check against the official docs.",
      chips: ["opened it", "date", "length"],
    },
    {
      from: 0,
      to: 2,
      label: "search the book",
      tone: "bad",
      outcome: "no such book",
      title: "Check 2: the book",
      note: "First she searches the author's name and finds a real writer with other books about web development. That proves the writer exists, not the book. Then she searches the title in a library catalogue, on the publisher's website and in two bookshop listings. No book has that title: the AI made it up and attached a real name.",
      chips: ["author: real", "title: not found", "library, publisher, bookshops"],
    },
    {
      from: 0,
      to: 2,
      label: "open the articles",
      tone: "good",
      outcome: "2 of 2 real",
      title: "Check 3: the articles",
      note: "Both articles open. She checks the site, the author and the date, and reads the first part of each to see that it is about caching, as the AI said.",
    },
    {
      from: 0,
      to: 2,
      label: "find the docs",
      tone: "good",
      outcome: "replaced",
      title: "Replace what failed",
      note: "Instead of asking for another book and hoping, she uses the caching page in the official docs of the cache her lab runs. She found it herself, so there is nothing to doubt.",
    },
    {
      from: 0,
      to: 3,
      label: "write the week",
      title: "Write the week plan",
      note: "Only checked items go in, each with how she checked it. One angle and one short lab a day; articles on days with weak data, videos on evenings with a good connection.",
      chips: ["I checked it exists (how)", "five angles", "daily labs"],
    },
    {
      from: 0,
      to: 0,
      label: "recall test",
      tone: "good",
      outcome: "week done",
      title: "End the week with recall",
      note: "On the last day she closes everything, explains caching aloud and checks her notes for gaps. Then she adds caching to her review list for a few days later and a week or two later.",
    },
  ],
  tryThis: [
    "Go to step 4 and compare the two searches: the author's name finds a real writer, the title finds nothing in a library catalogue, on the publisher's site or in two bookshops.",
    "At the end, count what Yara kept: two videos, one video for ideas only, both articles and the docs she found herself. One of the AI's six suggestions was invented.",
    "At step 3, one video is real but nine years old. What does she still check before she copies a command from it?",
  ],
  limits:
    "Here five of six suggestions were real and the fake one was found quickly. A real list can hold more invented items, a real book with the wrong chapter, or a link to a page that says something else. Finding an item proves it exists, not that it is correct: you still read it with your own judgement.",
};
