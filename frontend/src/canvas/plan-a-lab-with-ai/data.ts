import type { SequenceSpec } from "../renderers/sequence/types";

// Learn and Build with AI course, chapter 4.3 "Plan a lab with an AI chat".
// Yara plans lab day 1 on Qasir: she asks a chat assistant for a structured
// plan, cuts it from 75 to 40 minutes, checks the commands against Docker's
// own docs (one is out of date) and checks a suggested package on the official
// package site (it does not exist). Every number matches the chapter. See spec.md.
export const planALabWithAi: SequenceSpec = {
  kind: "sequence",
  title: "Planning lab day 1 with an AI chat",
  purpose: "See what the AI does well in a lab plan, and what only you and the official sources can check.",
  summary:
    "Yara asks a chat assistant for a lab plan with her goal, time, level, tools and what to break. The plan comes back at 75 minutes. She cuts it to 40 and keeps the AI's idea for the break step. Docker's docs show that one command in the plan is an old form. The package the plan suggests is not on the official package site. She asks the AI to fix the command, then saves the final plan.",
  actors: [
    { name: "Yara", sub: "40 minutes" },
    { name: "Chat assistant", sub: "drafts" },
    { name: "Docker docs", sub: "official" },
    { name: "Package site", sub: "official" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "ask for a plan",
      title: "Tell the AI what only she knows",
      note: "Her goal: run Qasir with its app, database and cache, and open one short link. Her time: 40 minutes. Her level: new to containers. Her tools: GitHub Codespaces with Docker. She asks for study, build, break and write parts with minutes.",
      chips: ["goal", "40 minutes", "beginner", "Codespaces", "what to break"],
    },
    {
      from: 1,
      to: 0,
      label: "plan: 75 min",
      tone: "warn",
      outcome: "too long",
      title: "A clear plan, and too big",
      note: "Study 15, build 40, break 10, write 10: 75 minutes. The build adds a load balancer and a package called shortlink-cache-helper, a name invented for this example. The break idea is good: ask for a short code that does not exist.",
      chips: ["docker-compose up -d", "shortlink-cache-helper"],
    },
    {
      from: 0,
      to: 0,
      label: "cut to 40 min",
      tone: "good",
      outcome: "40 minutes",
      title: "Cut it to her time",
      note: "Study 10, build 15, break 5, write 10: 40 minutes. She keeps one run of the app and the AI's break idea. The load balancer and the package move to her list for later days.",
    },
    {
      from: 0,
      to: 2,
      label: "check commands",
      tone: "warn",
      outcome: "out of date",
      title: "Check each command in the docs",
      note: "Docker's documentation (checked 2026-10-24) says docker-compose, with a hyphen, is Compose v1, first released in 2014. Newer versions use docker compose, with a space. The plan's version: line is obsolete and only produces a warning.",
      chips: ["old: docker-compose up -d", "docs: docker compose up -d"],
    },
    {
      from: 0,
      to: 3,
      label: "look up package",
      tone: "bad",
      outcome: "not found",
      title: "Check the package before any install",
      note: "She searches the official package site for her app's language. There is no package called shortlink-cache-helper. The AI made up the name, so she crosses it off her later list too.",
    },
    {
      from: 0,
      to: 1,
      label: "fix the command",
      title: "Use the AI again, with the facts",
      note: "She tells the chat assistant what the docs say and asks it to rewrite the build part, with one plain line on what each command does. She reads the new commands against the docs once more.",
    },
    {
      from: 0,
      to: 0,
      label: "save the plan",
      tone: "good",
      outcome: "ready",
      title: "Save the plan and the prompt",
      note: "The final plan goes into her phone notes as the start of her lab day 1 entry. The prompt that worked goes into her notes too, ready for lab day 2.",
    },
  ],
  tryThis: [
    "Go to step 4 to check your prediction: the docs call docker-compose the old Compose v1 and show docker compose for newer versions.",
    "Look at step 2. Which parts of the plan could only Yara judge, and which could only the official sites check?",
  ],
  limits:
    "A real AI plan may have no mistakes, or several. The out-of-date command and the made-up package are this example's; what stays true is the habit: cut the plan to your time, then check every command and package against official sources before you run or install anything.",
};
