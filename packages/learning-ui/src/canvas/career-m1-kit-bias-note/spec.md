---
artifact: canvas-spec
course: career-brand
chapter: "1.3"
beat: 6
slug: career-m1-kit-bias-note
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: A good kit cannot remove every bias

## Teaching claim
A stronger kit helps, but it does not erase every unfairness. The course does not promise that a better kit removes bias against a name, a place or a passport.

## Why this visual
Two equal kits and one reader, with two different outcomes, state the honest note in a calm picture. No names, countries or faces are drawn, so nobody is blamed or pitied.

## Data
```json
{
  "title": "A good kit cannot remove every bias",
  "purpose": "Two kits carry the same proof. A reader reads both. One gets a reply and one does not. A better kit helps, but not equally for everyone.",
  "limits": "This shows one old finding: in a 2004 US study of newspaper job ads, white-sounding names got about 50 percent more callbacks (replies asking for an interview), and a better resume helped them far more. It is old and about US ads, so it predicts nothing about remote hiring today. No study we found measures applicants from where you are. Mentors can help you choose where to apply.",
  "hint": "Two equal kits, one reader.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "a", "label": "Kit A", "kind": "note", "sub": "same proof", "x": 62, "y": 110 },
      { "id": "b", "label": "Kit B", "kind": "note", "sub": "same proof", "x": 358, "y": 110 },
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "reads both", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "a", "to": "reader", "label": "kit" },
      { "kind": "fly", "at": 1.5, "dur": 1.0, "from": "b", "to": "reader", "label": "kit" },
      { "kind": "say", "at": 2.8, "actor": "a", "text": "reply", "tone": "good" },
      { "kind": "say", "at": 3.4, "actor": "b", "text": "no reply", "tone": "warn" },
      { "kind": "verdict", "at": 4.2, "text": "Quality helps, but not equally for all", "tone": "warn" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
Making the kit stronger is still the part the learner controls. The picture also says, calmly, that it is not the only thing that decides a reply.

## Limits
In the `limits` field of the data. Keep the tone calm in the chapter text; no drama.
