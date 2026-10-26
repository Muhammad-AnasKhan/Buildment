---
artifact: canvas-spec
course: career-brand
chapter: "6.2"
beat: 3
slug: career-m6-paste-test
kind: sorter
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: The paste test

## Teaching claim
A resume should survive a paste into a plain text editor with its order and words intact. Select all, paste, read it: if it reads right, a program can read it too.

## Why this visual
The sorter asks the learner to predict, for each layout feature, whether it pastes cleanly. Each wrong try says what the paste does to it.

## Change from the module brief
The brief imagines pasting one of two sample files into a text box. No allowed primitive does that, so the picture asks the same question per feature. The advice is a cautious habit, not a vendor rule: it comes mostly from resume-service blogs, not from applicant tracking vendors' help pages.

## Data
```json
{
  "title": "The paste test",
  "purpose": "Sort eight layout choices into 'pastes cleanly' and 'can scramble' when a resume is pasted into a plain text editor, with a short reason after each wrong try.",
  "limits": "A cautious habit, not a vendor rule. Most layout advice comes from resume-service blogs, not from vendor help pages. Different programs read files differently, so the paste test is a quick check, not a guarantee. Checked 2026-10.",
  "config": {
    "buckets": [
      { "id": "clean", "label": "Pastes cleanly", "sub": "order and words kept" },
      { "id": "scramble", "label": "Can scramble", "sub": "order or words may break" }
    ],
    "cards": [
      { "id": "one-column", "text": "One column of text with normal headings", "answer": "clean", "why": { "scramble": "Plain text keeps its order when pasted." } },
      { "id": "two-columns", "text": "Two columns side by side", "answer": "scramble", "why": { "clean": "A paste can read across the columns line by line." } },
      { "id": "text-box", "text": "Contact details inside a text box", "answer": "scramble", "why": { "clean": "Text in a box can be skipped or pasted out of order." } },
      { "id": "bullets", "text": "Bullets made with the standard bullet character", "answer": "clean", "why": { "scramble": "A standard bullet pastes as a normal bullet." } },
      { "id": "star-bars", "text": "Skill levels drawn as bars or stars", "answer": "scramble", "why": { "clean": "A drawing pastes as nothing, so the level is lost." } },
      { "id": "selectable-file", "text": "A PDF or Word file with selectable text", "answer": "clean", "why": { "scramble": "Text you can select pastes as text." } },
      { "id": "name-image", "text": "Your name only inside a header image", "answer": "scramble", "why": { "clean": "An image pastes as nothing, so your name is lost." } },
      { "id": "written-links", "text": "Links written out as plain text as well", "answer": "clean", "why": { "scramble": "A written link survives a paste. A button may not." } }
    ],
    "deckLabel": "Layout choice",
    "prompt": "What happens when this is pasted?",
    "hint": "Tap the bucket this belongs in, or drag the card onto it.",
    "endNote": "Select all, paste into a plain text editor, and read it. If the order and the words survive, a program can read the file too."
  }
}
```

## What the learner should notice
The features that scramble are decoration. The ones that paste cleanly are plain structure, and nothing about the content is lost by keeping it plain.
