---
artifact: canvas-spec
course: career-brand
chapter: "2.4"
beat: 2
slug: career-m2-where-detail-helps
kind: sorter
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: Where the detail helps or distracts

## Teaching claim
A human detail helps in an About section and sometimes in a friendly first message. It distracts in a resume bullet, a case study or a message to a stranger.

## Why this visual
The sorter puts the same detail in eight places and asks the learner to decide what it does there. Three buckets keep "neutral" as a real answer.

## Data
Areej's notebook line is the detail (canon). In the course she uses it once, in her About section (7.5), and never more. Areej is a fictional fellow.

```json
{
  "title": "Where the detail helps or distracts",
  "purpose": "Sort eight places where Areej could mention her football notebook into 'helps', 'neutral' and 'distracts', with a short reason after each wrong try.",
  "limits": "Where a detail helps depends on the reader. These are course judgments, not research. Areej is a fictional fellow and uses the notebook line once, in her About section.",
  "config": {
    "buckets": [
      { "id": "helps", "label": "Helps", "sub": "the reader gains" },
      { "id": "neutral", "label": "Neutral", "sub": "no harm, no help" },
      { "id": "distracts", "label": "Distracts", "sub": "it hides the proof" }
    ],
    "cards": [
      { "id": "about", "text": "In her About section, one line near the end", "answer": "helps", "why": { "neutral": "About is where a reader looks for the person.", "distracts": "About is where a human line belongs." } },
      { "id": "bullet", "text": "Inside a resume bullet about the report fix", "answer": "distracts", "why": { "helps": "A bullet is for proof. The detail hides it.", "neutral": "It takes room from the number in the bullet." } },
      { "id": "comment", "text": "A short example in a comment on a post about averages", "answer": "helps", "why": { "neutral": "It makes her point with a true example.", "distracts": "It is on topic and adds one thing." } },
      { "id": "ta", "text": "One friendly line to her former teaching assistant", "answer": "neutral", "why": { "helps": "He knows her. It adds warmth, not new proof.", "distracts": "It does no harm in a friendly first message." } },
      { "id": "summary", "text": "In the two-line resume summary", "answer": "distracts", "why": { "helps": "Two lines are for role and proof.", "neutral": "Those two lines are the most valuable on the page." } },
      { "id": "stranger", "text": "As the opening of a message to a stranger founder", "answer": "distracts", "why": { "helps": "A stranger needs your ask, not your hobby.", "neutral": "It uses their first seconds on the wrong thing." } },
      { "id": "featured", "text": "A photo of the notebook in LinkedIn Featured", "answer": "neutral", "why": { "helps": "Featured is for proof of work.", "distracts": "It does no harm, but it adds no proof." } },
      { "id": "case-intro", "text": "In the intro of the slow report case study", "answer": "distracts", "why": { "helps": "The reader came for the report fix.", "neutral": "It delays the problem and the numbers." } }
    ],
    "deckLabel": "Place for the detail",
    "prompt": "What does the detail do here?",
    "hint": "Tap the bucket this place belongs in, or drag the card onto it.",
    "endNote": "A true human detail belongs where a reader looks for the person. Where the reader looks for proof, it gets in the way."
  }
}
```

## What the learner should notice
The detail is the same in every card. Only the reader's purpose changes, and that decides whether it helps.

## Limits
In the `limits` field of the data.
