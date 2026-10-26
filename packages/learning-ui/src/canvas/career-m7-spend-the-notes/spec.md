---
artifact: canvas-spec
course: career-brand
chapter: "7.4"
beat: 4
slug: career-m7-spend-the-notes
kind: sorter
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: Spend a small note budget

## Teaching claim
With only a few personalised notes a month, keep them for people you have a specific reason to write to. Connect plainly when you already talk, and comment first with people you do not know.

## Why this visual
The sorter puts eight real kinds of contact in front of the learner and asks how to reach each one. The three outcomes are the three ways the course teaches.

## Change from the module brief
The brief imagines a contact list with three note tokens and a warning for a promotional message. The sorter keeps the decision (note, plain connect, or comment first) and states the three-notes budget in the prompt and the end note. A promotional note to a stranger is the "comment first" bucket's wrong-try reason.

## Data
Course method from LinkedIn's own facts (checked 2026-10): keep notes for cold, high-value people with a reason; connect without a note when you already talk; comment first, then send the real message after they accept. Policy forbids promotional invitations to people you do not know. Areej's note budget is three a month (canon).

```json
{
  "title": "Spend a small note budget",
  "purpose": "You have three personalised notes this month. Sort eight contacts into 'use a note', 'connect only' and 'comment first', with a short reason after each wrong try.",
  "limits": "A course method, not a LinkedIn rule. Checked 2026-10; LinkedIn's pages differ on whether the monthly allowance is three or five, so the course plans for three. Policy forbids promotional invitations to people you do not know.",
  "config": {
    "buckets": [
      { "id": "note", "label": "Use a note", "sub": "specific, some tie" },
      { "id": "connect", "label": "Connect only", "sub": "you already talk" },
      { "id": "comment", "label": "Comment first", "sub": "then ask once seen" }
    ],
    "cards": [
      { "id": "classmate", "text": "A classmate you already talk to every week", "answer": "connect", "why": { "note": "You already talk. Save your notes for others.", "comment": "You know them. You need no comment first." } },
      { "id": "ta", "text": "Your former teaching assistant, now a backend engineer abroad", "answer": "note", "why": { "connect": "You have not spoken for a while. A note helps.", "comment": "He knows you. Ask him directly, with a note." } },
      { "id": "founder", "text": "A founder you have never spoken to", "answer": "comment", "why": { "note": "Comment first so they see your name. A note comes later.", "connect": "A comment first gives them a reason to accept." } },
      { "id": "teammate", "text": "A teammate from your university project", "answer": "connect", "why": { "note": "You know them. A plain request is enough.", "comment": "You know them. You need no comment first." } },
      { "id": "engineer", "text": "An engineer two connections away who commented on a PostgreSQL post", "answer": "note", "why": { "connect": "A short note about that post gives a reason.", "comment": "You have a clear shared topic. A note fits." } },
      { "id": "question", "text": "Someone who posted a question your project answers", "answer": "comment", "why": { "note": "Answer in a comment first. It helps others too.", "connect": "Answer them where they asked, then connect." } },
      { "id": "colleague", "text": "A colleague from your internship who messages you already", "answer": "connect", "why": { "note": "You already talk. Keep the note for someone else.", "comment": "You already talk. A comment is not needed." } },
      { "id": "company", "text": "An engineer at a company you like who has never heard of you", "answer": "comment", "why": { "note": "Build a reason first with a useful comment.", "connect": "A comment first gives them a reason to accept." } }
    ],
    "deckLabel": "Contact",
    "prompt": "How do you reach this person?",
    "hint": "Tap how you would reach them, or drag the card onto it.",
    "endNote": "Three notes a month go to people you have a specific reason to write to. Connect plainly when you already talk, and comment first with strangers."
  }
}
```

## What the learner should notice
Only two of the eight get a note now. Three need no note at all, and three start with a comment.
