---
artifact: canvas-spec
course: career-brand
chapter: "1.3"
beat: 3
slug: career-m1-checkable-or-claim
kind: sorter
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: Checkable, or only a claim?

## Teaching claim
A line is checkable when a reader can look something up or test it without asking you. "We" and adjectives are only claims.

## Why this visual
The sorter makes the learner commit to one of two bins for each line and answers every wrong try with a short reason. It uses two buckets so the choice is clean.

## Change from the module brief
The brief lists "AWS certificate" as a card. A certificate can be checked with its issuer but says little about work, which is the point of beat 4 (a certificate is a small line). Putting it in a two-bin sorter would teach a half truth, so it is replaced by a case study card. The report-time line is an illustrative example, not Areej's.

## Data
```json
{
  "title": "Checkable, or only a claim?",
  "purpose": "Sort eight profile lines into 'a reader can check' and 'only a claim', with a short reason after each wrong try.",
  "limits": "Real lines are messier, and some can be argued both ways. The report-time line is an illustration, not a real person's result. A checkable line can still be false; checkable only means a reader could find out.",
  "config": {
    "buckets": [
      { "id": "check", "label": "A reader can check", "sub": "they can verify it" },
      { "id": "claim", "label": "Only a claim", "sub": "they must trust you" }
    ],
    "cards": [
      { "id": "report-time", "text": "Cut report time from 12 to 3 minutes (team dashboard)", "answer": "check", "why": { "claim": "It names a result and where it came from." } },
      { "id": "passionate", "text": "Passionate team player", "answer": "claim", "why": { "check": "No one can look this up or test it." } },
      { "id": "live-demo", "text": "Live demo with a guest login", "answer": "check", "why": { "claim": "A stranger can open it and try it." } },
      { "id": "twenty-tech", "text": "Expert in 20 technologies", "answer": "claim", "why": { "check": "Twenty names prove nothing. Which did you use?" } },
      { "id": "queue-import", "text": "Moved the nightly import into a queue; it stopped timing out (job logs)", "answer": "check", "why": { "claim": "The job logs show whether it stopped timing out." } },
      { "id": "we-improved", "text": "We improved performance", "answer": "claim", "why": { "check": "Who improved what? 'We' hides who did it." } },
      { "id": "case-study", "text": "Case study with the before and after query plans", "answer": "check", "why": { "claim": "The two plans are there to compare." } },
      { "id": "responsible", "text": "Responsible for backend services", "answer": "claim", "why": { "check": "A duty says the job, not what changed." } }
    ],
    "deckLabel": "Profile line",
    "prompt": "Could a reader check this line?",
    "hint": "Tap the bucket this line belongs in, or drag the card onto it.",
    "endNote": "A line is checkable when a reader can look something up or test it without asking you. 'We' and adjectives hide who did what."
  }
}
```

## What the learner should notice
The checkable lines are not longer or fancier. They name something that exists elsewhere: a dashboard, a log, a demo, a pair of plans. Module 3 turns checkable lines into claim cards.

## Limits
In the `limits` field of the data.
