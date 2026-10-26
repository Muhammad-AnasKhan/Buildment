---
artifact: canvas-spec
course: career-brand
chapter: "4.1"
beat: 1
slug: career-m4-ride-app-weekend
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: A ride app in one weekend

## Teaching claim
An app built fast with an AI tool can look finished and still have nobody using it. A working app on its own proves little.

## Why this visual
The app is drawn complete, while the two groups it needs are drawn empty. The gap is the story.

## Data
Sireen is from the canon (scene cast, 4.1). Card register is used; the illustrated register needs custom code.

```json
{
  "title": "A ride app in one weekend",
  "purpose": "Sireen builds a ride-sharing app in a weekend with an AI coding tool. The screens are done. No drivers and no riders have signed up.",
  "limits": "The story is illustrative. It does not say AI tools make apps worse; it says a finished app is not the same as a used one.",
  "hint": "A finished app and two empty groups.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "sireen", "label": "Sireen", "kind": "user", "sub": "one weekend", "x": 62, "y": 105 },
      { "id": "app", "label": "Ride app", "kind": "phone", "sub": "screens done", "x": 358, "y": 105 },
      { "id": "riders", "label": "Riders", "kind": "user", "sub": "0 signed up", "x": 62, "y": 250 },
      { "id": "drivers", "label": "Drivers", "kind": "user", "sub": "0 signed up", "x": 358, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "sireen", "to": "app", "label": "built in a weekend" },
      { "kind": "say", "at": 1.4, "actor": "app", "text": "all screens", "tone": "good" },
      { "kind": "fly", "at": 2.4, "dur": 1.0, "from": "app", "to": "riders", "label": "come and ride" },
      { "kind": "fly", "at": 3.6, "dur": 1.0, "from": "app", "to": "drivers", "label": "come and drive" },
      { "kind": "say", "at": 4.8, "actor": "riders", "text": "nobody came", "tone": "bad" },
      { "kind": "say", "at": 5.0, "actor": "drivers", "text": "nobody came", "tone": "bad" },
      { "kind": "verdict", "at": 5.6, "text": "Built fast, used by nobody", "tone": "bad" }
    ],
    "loop": 9.5
  }
}
```

## What the learner should notice
Nothing in the app is broken. What is missing is the proof that anyone wanted it.
