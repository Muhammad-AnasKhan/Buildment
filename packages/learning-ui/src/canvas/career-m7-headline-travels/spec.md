---
artifact: canvas-spec
course: career-brand
chapter: "7.2"
beat: 1
slug: career-m7-headline-travels
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: The headline travels with your name

## Teaching claim
The headline is the line under your name. It shows on your profile and in search results, so its first words are what a stranger meets. Say what you do and who you do it for first.

## Why this visual
One line, seen in two places, shows why the first words matter.

## Data
LinkedIn's help page says the headline can differ from your job title and can promote an area of expertise; it states no length limit (checked 2026-10). Type it in the editor and read the counter on your own screen.

```json
{
  "title": "The headline travels with your name",
  "purpose": "The headline sits under your name on your profile and shows again, beside your name, in a search result. A reader meets its first words in both places.",
  "limits": "Checked 2026-10; if your screen differs, follow your screen. LinkedIn's page gives no length rule for the headline, so do not trust a list that gives one. The picture is simplified.",
  "hint": "One line, two places.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "profile", "label": "Profile", "kind": "note", "sub": "name + headline", "x": 62, "y": 110 },
      { "id": "search", "label": "Search result", "kind": "note", "sub": "same headline", "x": 358, "y": 110 },
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "scans names", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.1, "from": "profile", "to": "search", "label": "headline travels" },
      { "kind": "fly", "at": 1.8, "dur": 1.0, "from": "search", "to": "reader", "label": "first words" },
      { "kind": "say", "at": 3.0, "actor": "reader", "text": "will click", "tone": "accent" },
      { "kind": "verdict", "at": 3.8, "text": "The headline travels with your name", "tone": "accent" }
    ],
    "loop": 7.5
  }
}
```

## What the learner should notice
The search result shows the headline and little else, so the headline does most of the work.
