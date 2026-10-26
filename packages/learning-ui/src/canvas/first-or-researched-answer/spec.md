---
artifact: canvas-spec
course: build-with-ai
chapter: 5.2
slug: first-or-researched-answer
version: 1
owner: chapter-writer
---

# Canvas spec: First answer or researched answer

## Teaching claim
Only the primary page fixes an out of date fact. Your own facts make an answer fit you. A second assistant, by itself, can repeat the same old answer. The best start has the page read and your facts given.

## Why a canvas
A list of three habits is read and forgotten. Switching each habit on and off in one picture, and watching which kind of answer Yara ends with, shows that the three do different jobs and that none of them can stand in for another. The surprise is the "Fits her only" card: giving facts makes the answer fit better without making it current.

## Model
- Primitive: context picker (`models/context-picker.ts`, `makeContextPickerCanvas`). This folder holds data only.
- Inputs (three factors, two choices each):

  | Factor | Choices | Start |
  |---|---|---|
  | Primary page | Not read, Read | Not read |
  | Her own facts | Not given, Given | Not given |
  | Second assistant | Not asked, Asked | Not asked |

- Outputs: one of four answers with a one-line reason.

  | Answer | When it is picked | Reason shown |
  |---|---|---|
  | Researched | page Read and facts Given (any second assistant) | The page fixes the facts, her facts fix the fit |
  | Current only | page Read, facts Not given | The rules are current, but not shaped to her hours or laptop |
  | Fits her only | page Not read, facts Given | It fits her, but an out of date rule can still sit inside it |
  | Old answer | page Not read, facts Not given (with or without a second assistant) | One answer with no page and no facts is a first answer; two assistants can repeat the same old rule |

- Rule: the first rule whose facts all match wins (`resolveContext`). Eight combinations; all four answers are reachable; the data passes `checkContextConfig`.
- Dossier ids behind the rules: the page fixes out of date facts (B69 Hacktoberfest 2026 no longer counts pull requests; B70 Google Summer of Code is for students or open source beginners, 18 or older); context gives a more targeted answer (B11, vendor guidance, no effect size); a second assistant can repeat the same wrong answer (B15, 60% on one leaderboard when both models were wrong).
- Assumptions: the rules are the course's own, written for one example. They are not a measurement.
- Limitations: real research has more steps and more than one good answer.

## Rendering
Context picker primitive: inline SVG, 420 wide, three factor rows of two pills, four option cards in a two column grid, a moving ring with a "Fits" pill and a banner with the reason. Pills are SVG buttons with `role="button"` and `aria-pressed`. One control outside the picture: Reset.

## Copy
- What this shows: the kind of answer Yara ends with, and why.
- Try this: 1) Leave the page unread and give her facts. See "Fits her only". 2) Now switch the page to Read. See "Researched". 3) Reset, then ask the second assistant with nothing else changed. See that "Old answer" stays.
- What changed: the ring moves and the reason changes.
- Limits: in `limits` (shown in the fold under the picture).

## Edge cases
Labels are short (choices at most 14 characters, factors at most 18, options at most 14, sub lines at most 18). Reasons are at most about 90 characters and wrap to at most three lines. No colour in data. No em or en dashes.

## Accessibility
Pills are keyboard reachable with a visible focus ring and the name "Factor: Choice". A polite live region announces the best fit and the reason. Motion is off under `prefers-reduced-motion`. The figure's text alternative lists the factors, the fit and the reason.

## Acceptance criteria
- [x] The claim is testable (eight contexts, four answers).
- [x] The model is the shared context picker model; this data passes `checkContextConfig`.
- [x] Short labels, legible at 375 px.
- [x] Prediction before (chapter 5.2 predict on giving facts without reading the page) and a transfer check after (quick check with a new case).
- [x] Reader fallback: the text alternative and `allContexts` give a table.

## Placement
Chapter 5.2 "Research before you ask", beat 5 ("Give the assistant your facts"), after the predict. Yara and the assistant's answers are fictional. Program rules were checked on 2026-10-25.
