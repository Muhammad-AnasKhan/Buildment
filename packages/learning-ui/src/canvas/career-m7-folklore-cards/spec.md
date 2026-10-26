---
artifact: canvas-spec
course: career-brand
chapter: "7.3"
beat: 2
slug: career-m7-folklore-cards
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Folklore, and what LinkedIn says

## Teaching claim
Treat any guide that gives an exact number (a magic hour, a magic word count, a magic hashtag count) as a guess. LinkedIn's own tips are plain: be relevant, avoid being overly promotional, and comment on others' posts.

## Why this visual
Folklore claims arrive with no first-party source. LinkedIn's own tips arrive after, and the learner decides which to trust.

## Data
The folklore cards are "the first hour decides", "links are punished" and "use exactly three hashtags". None has a first-party source. LinkedIn's help page tips: write content your audience relates to, avoid being overly promotional, keep the profile complete, share frequently and react and comment on others' posts. A 2019 newsroom post said no format is favoured (old). Checked 2026-10.

```json
{
  "title": "Folklore, and what LinkedIn says",
  "purpose": "Guides say the first hour decides and links are punished. Neither has a first-party source. LinkedIn's own page says to be relevant and to comment on others' posts.",
  "limits": "Checked 2026-10; if your screen differs, follow your screen. The cards are examples of common claims. Nobody outside LinkedIn can give a reliable recipe, and the page's tips are general, not a guarantee.",
  "hint": "Two sources, one reader.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "guides", "label": "Guides", "kind": "note", "sub": "exact numbers", "x": 62, "y": 110 },
      { "id": "linkedin", "label": "LinkedIn", "kind": "note", "sub": "relate, comment", "x": 358, "y": 110 },
      { "id": "reader", "label": "You", "kind": "user", "sub": "who to trust", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "guides", "to": "reader", "label": "first hour decides" },
      { "kind": "fly", "at": 1.5, "dur": 1.0, "from": "guides", "to": "reader", "label": "links are punished" },
      { "kind": "say", "at": 2.7, "actor": "reader", "text": "no source", "tone": "warn" },
      { "kind": "fly", "at": 3.4, "dur": 1.0, "from": "linkedin", "to": "reader", "label": "be relevant" },
      { "kind": "fly", "at": 4.6, "dur": 1.0, "from": "linkedin", "to": "reader", "label": "comment on posts" },
      { "kind": "say", "at": 5.8, "actor": "reader", "text": "trust the page", "tone": "good" },
      { "kind": "verdict", "at": 6.4, "text": "Treat exact numbers as guesses", "tone": "good" }
    ],
    "loop": 10
  }
}
```

## What the learner should notice
The folklore is specific and unsourced. The first-party advice is general and written down.
