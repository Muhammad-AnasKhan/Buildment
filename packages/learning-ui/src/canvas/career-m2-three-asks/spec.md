---
artifact: canvas-spec
course: career-brand
chapter: "2.4"
beat: 3
slug: career-m2-three-asks
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Ask three people for a story

## Teaching claim
Ask three people who worked with you: "Tell me about a time I did something well." Look for what repeats. It is a way to find your material, not a test.

## Why this visual
Three replies to one request, each in different words, with the repeated meaning lit up.

## Data
The replies are from the canon (Areej's reflected best-self asks). Areej is a fictional fellow.

```json
{
  "title": "Ask three people for a story",
  "purpose": "Areej asks her lead, the shop owner and a club organiser for a time she did well. Each replies in their own words. What repeats: she finds a problem, fixes it and explains it.",
  "limits": "Areej is a fictional fellow. Researchers call this a reflected best-self exercise; the idea comes from a theory paper, not a trial. It helps you find material. It does not prove a strength to an employer.",
  "hint": "Watch for the words that repeat.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "lead", "label": "Her lead", "kind": "user", "sub": "internship", "x": 62, "y": 105 },
      { "id": "owner", "label": "Shop owner", "kind": "user", "sub": "freelance", "x": 210, "y": 105 },
      { "id": "organiser", "label": "Organiser", "kind": "user", "sub": "volunteer", "x": 358, "y": 105 },
      { "id": "areej", "label": "Areej", "kind": "user", "sub": "asked all three", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "lead", "to": "areej", "label": "found it early" },
      { "kind": "fly", "at": 1.5, "dur": 1.0, "from": "owner", "to": "areej", "label": "explained it" },
      { "kind": "fly", "at": 2.7, "dur": 1.0, "from": "organiser", "to": "areej", "label": "taught patiently" },
      { "kind": "say", "at": 3.9, "actor": "areej", "text": "what repeats", "tone": "good" },
      { "kind": "mark", "at": 3.9, "actor": "areej", "tone": "good" },
      { "kind": "verdict", "at": 4.5, "text": "What repeats: find, fix, explain", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
No single reply is the answer. The repeated meaning across three different settings is.

## Limits
In the `limits` field of the data.
