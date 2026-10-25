---
artifact: canvas-spec
course: career-brand
chapter: "8.1"
beat: 1
slug: career-m8-post-gone
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Her best post, gone

## Teaching claim
A post that lives only on one platform can disappear with your account there, and every link to it breaks with it. Keep the original on a page you control.

## Why this visual
One post, one platform and one resume link, all lost together.

## Data
Diala is from the canon (scene cast, 8.1). Her post was about cutting her team's CI pipeline from 22 minutes to 9 minutes. Do not name a real platform as the one she lost. Card register is used; the illustrated register needs custom code.

```json
{
  "title": "Her best post, gone",
  "purpose": "Diala wrote a strong post about cutting her team's CI pipeline from 22 minutes to 9. It lived on one blogging site. When she lost access to her account there, the post went too, and the link on her resume broke.",
  "limits": "Diala is a fictional fellow and the blogging site is not named. Platforms change their rules and can lock accounts; that is why the original belongs on a page you control.",
  "hint": "One copy, on a site she did not control.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "diala", "label": "Diala", "kind": "user", "sub": "DevOps engineer", "x": 62, "y": 110 },
      { "id": "platform", "label": "Blog site", "kind": "server", "sub": "her only copy", "x": 358, "y": 110 },
      { "id": "resume", "label": "Resume link", "kind": "note", "sub": "points there", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "diala", "to": "platform", "label": "CI: 22 to 9 min" },
      { "kind": "say", "at": 1.4, "actor": "platform", "text": "account lost", "tone": "bad" },
      { "kind": "say", "at": 2.2, "actor": "resume", "text": "link broken", "tone": "bad" },
      { "kind": "verdict", "at": 3.0, "text": "Her best post is gone", "tone": "bad" }
    ],
    "loop": 7
  }
}
```

## What the learner should notice
Nothing was wrong with the post. The only copy lived somewhere she could not keep.
