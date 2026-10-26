---
artifact: canvas-spec
course: career-brand
chapter: "2.2"
beat: 3
slug: career-m2-claims-under-pillars
kind: sorter
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: Claims without proof turn grey

## Teaching claim
A claim can hold up a pillar only when it comes with a proof. A word like "great communicator" cannot, until an example is attached.

## Why this visual
The sorter makes the learner decide, claim by claim, whether it can hold a pillar now. Each wrong try says what is missing.

## Change from the module brief
The brief imagines dragging claims under three pillars with a grey and cracked state. The sorter sorts into buckets, so the picture is "Holds a pillar" against "Needs a proof first". The learning is the same: a claim with no attached proof is the one that cracks the pillar. The grey state is the "Needs a proof first" bucket.

## Data
Claims are Areej's (canon). Areej is a fictional fellow and her numbers are illustrative.

```json
{
  "title": "Claims without proof turn grey",
  "purpose": "Sort eight claims from Areej's notes into 'holds a pillar' and 'needs a proof first', with a short reason after each wrong try.",
  "limits": "Whether a claim 'has proof' here means the notes already point to a proof. 'Great communicator' could hold a pillar once an example is attached. Areej and her numbers are fictional and illustrative.",
  "config": {
    "buckets": [
      { "id": "holds", "label": "Holds a pillar", "sub": "a proof is attached" },
      { "id": "needs", "label": "Needs a proof first", "sub": "only a word so far" }
    ],
    "cards": [
      { "id": "report", "text": "Cut a report's p95 from 4.6 s to 0.41 s", "answer": "holds", "why": { "needs": "It has numbers, a window and a place to check." } },
      { "id": "communicator", "text": "Great communicator", "answer": "needs", "why": { "holds": "No example is attached yet." } },
      { "id": "invoice", "text": "Saved a print shop about 3 hours a week, net", "answer": "holds", "why": { "needs": "A timing sheet backs it, net of upkeep." } },
      { "id": "cloud", "text": "Expert in cloud", "answer": "needs", "why": { "holds": "Nothing in her notes proves it." } },
      { "id": "key", "text": "Replaced a leaked key and turned on push protection", "answer": "holds", "why": { "needs": "The revoked key and the setting can be shown." } },
      { "id": "passionate", "text": "Passionate about performance", "answer": "needs", "why": { "holds": "A feeling is not a proof." } },
      { "id": "loadtest", "text": "Cut an endpoint's p95 from 820 ms to 95 ms in a load test", "answer": "holds", "why": { "needs": "The same script, data and laptop back it." } },
      { "id": "teamplayer", "text": "Team player", "answer": "needs", "why": { "holds": "Which team, and what did she do?" } }
    ],
    "deckLabel": "Areej's claim",
    "prompt": "Can this claim hold up a pillar?",
    "hint": "Tap the bucket this claim belongs in, or drag the card onto it.",
    "endNote": "A pillar stands on claims that come with a proof. The grey ones are not wrong; they just need an example or a number first."
  }
}
```

## What the learner should notice
The four that hold are the ones with a number or a visible action. The four that need proof are words about her, not things she did.

## Limits
In the `limits` field of the data.
