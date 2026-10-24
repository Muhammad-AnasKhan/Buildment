import type { StateMachineSpec } from "../renderers/state-machine/types";

// Learn and Build with AI course, chapter 4.5 "The lab log on GitHub".
// Yara's lab day 4 entry becomes one commit and one push to qasir-labs. The
// check before the commit finds her .env file with the database password, and
// committing it is refused. Every name and file matches the chapter. See spec.md.
export const labLogCommitPush: StateMachineSpec = {
  kind: "state-machine",
  title: "From a lab entry to GitHub",
  purpose: "Follow one lab entry through a check for secrets, a commit with a clear message, and a push.",
  summary:
    "Yara writes her lab day 4 entry in five parts. Her check before the commit shows a .env file holding the database password; committing it is refused, and she adds .env to .gitignore. The check then shows only the entry. She commits it with a message that says what changed, and pushes it to her qasir-labs repository.",
  states: [
    { id: "entry", name: "Entry written", sub: "five parts", col: 0, row: 0 },
    { id: "checked", name: "Checked", sub: "nothing secret", col: 1, row: 0 },
    { id: "committed", name: "Committed", sub: "clear message", col: 2, row: 0 },
    { id: "pushed", name: "Pushed", sub: "qasir-labs", col: 2, row: 1 },
  ],
  edges: [
    { from: "entry", to: "checked", label: "check" },
    { from: "checked", to: "checked", label: "commit a key", kind: "rejected" },
    { from: "checked", to: "committed", label: "commit" },
    { from: "committed", to: "pushed", label: "go" },
  ],
  steps: [
    {
      state: "entry",
      title: "Write the entry",
      note: "labs/day-04-stop-the-cache.md has five parts: the goal, what she did, what broke, what she learned, and what AI helped with. The AI line says a chat assistant explained what docker compose stop does, and that she checked it in Docker's docs.",
      chips: ["goal", "what I did", "what broke", "what I learned", "what AI helped with"],
    },
    {
      state: "checked",
      edge: 0,
      title: "Check before the commit",
      note: "git status lists the files that changed. Two appear: her entry, and a .env file that holds the database password for her codespace.",
      chips: ["git status", "labs/day-04-stop-the-cache.md", ".env"],
    },
    {
      state: "checked",
      edge: 1,
      tone: "bad",
      outcome: "refused",
      title: "Never commit a password or key",
      note: "Adding .env would put the password in the history of a public repository, where anyone can read it and where it stays even if she deletes the file later.",
    },
    {
      state: "checked",
      tone: "good",
      outcome: "clean",
      title: "Fix it, then check again",
      note: "She adds the line .env to her .gitignore file, so Git leaves it out. git status now shows only the entry and .gitignore. No names, phone numbers or keys are in the entry.",
      chips: [".gitignore: .env"],
    },
    {
      state: "committed",
      edge: 2,
      title: "Commit with a clear message",
      note: "She adds the two files and commits them. The message says what changed, so a mentor can read her week from the list of commits alone.",
      chips: ["git add", "git commit -m \"Day 4: stop the cache, links still work but slower\""],
    },
    {
      state: "pushed",
      edge: 3,
      tone: "good",
      outcome: "on GitHub",
      title: "Push it",
      note: "git push sends the commit to her qasir-labs repository on GitHub. The entry now has a date in the history, and her mentor can read it from a phone.",
      chips: ["git push"],
    },
  ],
  tryThis: [
    "Go to step 4 to check your prediction: once .env is in .gitignore, git status shows only the entry and .gitignore.",
    "At step 5, read only the commit message. What could a mentor learn about Yara's lab day 4 without opening the file?",
  ],
  limits:
    "This shows one entry and one push from a repository that is already connected to GitHub. Your first push may ask you to sign in. GitHub tries to block some secrets in public repositories, but it does not catch everything, so the check before the commit is yours.",
};
