---
artifact: canvas-spec
course: career-brand
chapter: "4.2"
beat: 4
slug: career-m4-project-page
kind: slot-card
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: What still counts on a project page

## Teaching claim
When building is fast, a project page earns trust through a real user, a measured result, a decision with its reason, a bug found and fixed, an AI-use log and a written explanation of the hardest part. A feature count, speed and looks do not.

## Why this visual
The slot card turns the page into six fields a reader would ask about. The learner fills each with evidence and sees three popular boasts refused.

## Change from the module brief
The brief imagines toggling evidence on and off. A slot card is the same idea in reverse: fill the fields and see "checkable parts: N of 6" rise. The page is Areej's planned project, Raqim Stock, so every chip comes from the canon (her plan and her AI-use log example). The page describes what the finished page will hold, not results she already has.

## Data
```json
{
  "title": "What still counts on a project page",
  "purpose": "Fill the six fields of Raqim Stock's project page with the evidence a reader can ask about: a real user, a result, a decision, a bug fixed, an AI-use log and the hardest part. A feature count, speed and looks are refused.",
  "limits": "Raqim Stock is Areej's planned project, so the page shows what it will hold, not finished results. Areej is a fictional fellow. A project page needs more than six fields in real life.",
  "config": {
    "cardTitle": "Raqim Stock project page",
    "claim": "A stock tool for a print shop",
    "slots": [
      { "id": "user", "label": "Real user" },
      { "id": "result", "label": "Result" },
      { "id": "decision", "label": "Decision" },
      { "id": "bug", "label": "Bug fixed" },
      { "id": "log", "label": "AI-use log" },
      { "id": "hard", "label": "Hard part" }
    ],
    "chips": [
      { "id": "user", "text": "The print shop owner, from day one", "slot": "user", "why": "A real person who uses it: the Real user." },
      { "id": "result", "text": "Stockouts per month, against 5 in two months", "slot": "result", "why": "A measured result with a baseline." },
      { "id": "decision", "text": "Stock updates run in one transaction", "slot": "decision", "why": "A decision a reader can ask about: the Decision." },
      { "id": "bug", "text": "Two sales at once broke the count; a transaction fixed it", "slot": "bug", "why": "A bug found by testing, and its fix." },
      { "id": "log", "text": "Date, what I asked, used and checked, what it got wrong", "slot": "log", "why": "A record of how AI was used and checked." },
      { "id": "hard", "text": "Reorder levels that never double count", "slot": "hard", "why": "The hardest part, in the writer's words." },
      { "id": "features", "text": "12 features shipped", "slot": null, "why": "A feature count proves nothing a reader can check." },
      { "id": "weekend", "text": "Built in a weekend with AI help", "slot": null, "why": "Speed is not understanding." },
      { "id": "design", "text": "Clean, modern design", "slot": null, "why": "A reader cannot check taste." }
    ],
    "assembled": "Real user: the print shop owner, from day one. Result: stockouts per month, against 5 in two months. Decision: stock updates run in one transaction. Bug fixed: two sales at once broke the count; a transaction fixed it. AI-use log: the date, what I asked, used and checked, and what it got wrong. Hardest part: reorder levels that never double count.",
    "hint": "Tap a chip, then the field it fills. Or drag the chip onto the field.",
    "endNote": "Each field is something a reader can ask about. Features, speed and looks are not evidence of understanding."
  }
}
```

## What the learner should notice
The three refused chips are the easiest to write. The six accepted ones each need real work, and each can be followed by a question.
