---
artifact: canvas-spec
course: career-brand
chapter: "5.2"
beat: 5
slug: career-m5-links-in-six-months
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Links that still work in six months

## Teaching claim
Free hosting plans sleep, expire and change their rules. Point your resume at something that lasts, such as a static case study page and a short recording, and treat the live demo as a bonus.

## Why this visual
A day strip shows a free database expiring, a resume link breaking, and a static page that is unaffected.

## Data
Free-plan facts are dated and must be checked again before publishing: a free database on one host is 1 GB, expires 30 days after creation and is deleted after a 14-day grace period (checked 2026-10, verify before publish). Areej's club data was moved before the 30 days ended (canon). Use that detail only in this chapter.

```json
{
  "title": "Links that still work in six months",
  "purpose": "A free database expires 30 days after it is created and is deleted 14 days later. A resume link to the demo breaks. A static case study page and a recording keep working.",
  "limits": "Plan details change. Check before you rely on it: read the plan page the week you publish, and keep a screenshot and a short recording as a backup. The 30 and 14 days are one host's rules on one date (checked 2026-10), not a rule for every host.",
  "hint": "Watch the free plan run out.",
  "scene": {
    "width": 420,
    "height": 340,
    "actors": [
      { "id": "db", "label": "Database", "kind": "database", "sub": "free, 30 days", "x": 62, "y": 105 },
      { "id": "link", "label": "Resume link", "kind": "note", "sub": "to the demo", "x": 210, "y": 105 },
      { "id": "base", "label": "Case study", "kind": "note", "sub": "static page", "x": 358, "y": 105 }
    ],
    "strip": { "y": 290, "from": 0, "to": 45, "unit": "day", "caption": "days since the database was created", "every": 15 },
    "events": [
      { "kind": "tag", "at": 0.5, "row": 0, "value": 30, "label": "day 30: expires", "tone": "warn" },
      { "kind": "say", "at": 1.0, "actor": "db", "text": "expired", "tone": "bad" },
      { "kind": "say", "at": 1.8, "actor": "link", "text": "link breaks", "tone": "bad" },
      { "kind": "say", "at": 2.6, "actor": "base", "text": "still opens", "tone": "good" },
      { "kind": "tag", "at": 3.2, "row": 1, "value": 44, "label": "day 44: deleted", "tone": "bad" },
      { "kind": "verdict", "at": 4.2, "text": "Link to something that lasts", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
The static page has no clock on it. Only the live pieces do.
