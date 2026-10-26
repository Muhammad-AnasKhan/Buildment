---
artifact: canvas-spec
course: build-with-ai
chapter: 5.3
slug: agreement-is-not-proof
version: 1
owner: chapter-writer
---

# Canvas spec: Sort what two answers tell Yara

## Teaching claim
Where two assistants differ is where to look first. Where they agree on a fact that matters, the primary page still decides, because different models often make the same mistake. Where they agree on wording, the answer can stand as a draft.

## Why a canvas
The rule has three parts, and the hard part is telling a fact from wording. Sorting eight pairs of answers, with a reason after every wrong try, makes the learner practise that call. The tricky cards are the agreeing facts (a reward rule, a licence, install commands), which feel safe because two assistants agree.

## Model
- Primitive: sorter (`models/sorter.ts`, `makeSorterCanvas`). This folder holds data only.
- Buckets (3): They differ (look here first); Agree: a fact (still read the page); Agree: wording (fine as a draft).
- Cards (8): GSoC who can join, A against B (differ); four pull requests in October, both agree (agree on a fact); a friendly first line, both agree (wording); free plan email limit, A and B give different numbers (differ); a blog post title, both agree (wording); a licence allows paid use, both agree (fact); three install commands, both agree (fact); an application deadline, A and B give different dates (differ). Three differ, three fact, two wording.
- Rule: a right bucket moves the card; a wrong bucket keeps it and shows the reason written for that card and that bucket. The round ends when the deck is empty.
- Dossier ids: sampling several answers and comparing, and inconsistencies as a signal (B12, B16, vendor guidance); different models share mistakes, 60% on one leaderboard when both were wrong (B15); the Hacktoberfest 2026 and GSoC facts on the cards (B69, B70). That disagreement is where to check, and agreement is not proof, is the course's method built on those sources.
- Assumptions: the cards are invented examples; "a fact that matters" means a rule, limit, price, date, licence or command.
- Limitations: real answers mix agreement and difference in one reply, and stakes decide what matters.

## Rendering
Sorter primitive: inline SVG card and three trays; tap a tray or drag the card. Card text at most 40 characters a line and three lines; reasons at most 60 characters; bucket labels at most 15 characters.

## Copy
- What this shows: which of three things a pair of answers tells Yara.
- Try this: 1) Sort the two cards where both assistants agree on a rule. 2) Find the card where agreement can stand.
- What changed: the card moves, the bucket count ticks up, and a wrong try shows its reason.
- Limits: in `limits`.

## Edge cases
Wrong tries keep the card. Sort again deals a new order. Keyboard users reach the three bucket buttons.

## Accessibility
Bucket buttons are real buttons labelled with name, gloss and count. A polite live region reads each result. Motion is off under `prefers-reduced-motion`.

## Acceptance criteria
- [x] The claim is testable.
- [x] Every wrong bucket has a reason of at most 60 characters (`checkDeck`).
- [x] Prediction before (a predict about two matching first lines) and a transfer check after (quick check with a new case).
- [x] No colour in data; no em or en dashes.

## Placement
Chapter 5.3 "Two assistants, then the whole picture", beat 3 ("Sort what two answers tell you"). Yara and the answers are fictional. Program facts were checked on 2026-10-25.
