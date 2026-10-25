---
artifact: canvas-spec
course: career-brand
chapter: "8.3"
beat: 2
slug: career-m8-search-picks-one
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Search picks one copy, with no penalty

## Teaching claim
When the same article is on several sites, Google picks one version to show, which may be another site's copy. Saying where the original is, with a canonical link, is a hint and not a rule. You are not penalised for sharing copies.

## Why this visual
Three copies reach Google and it picks one. The picture does not punish the copies.

## Data
Based on Google Search Central (checked 2026-10): you state a preference by redirects or `rel="canonical"` (strong signals) or a sitemap (weak signal), and Google calls this "a hint, not a rule". For syndicated copies Google says canonical is not recommended and partners should block indexing; a fellow cannot make a platform do that. Without any preference a site "will likely do just fine". One platform's help says duplicate content "may be penalized"; Google describes choosing a version. So say: Google picks one version and may pick the other site's copy.

```json
{
  "title": "Search picks one copy, with no penalty",
  "purpose": "The same article is on your site and on two platforms. Google sees all three and picks one version to show. It may pick the other site's copy. A canonical link is a hint, not a rule.",
  "limits": "Checked 2026-10; if your screen differs, follow your screen. Google calls canonical signals a hint, so expect them to help and not to guarantee anything. Cross-posting is for readers, not a ranking trick.",
  "hint": "Three copies, one version shown.",
  "scene": {
    "width": 420,
    "height": 340,
    "actors": [
      { "id": "google", "label": "Google", "kind": "server", "sub": "picks a version", "x": 210, "y": 105 },
      { "id": "own", "label": "Your site", "kind": "note", "sub": "the original", "x": 62, "y": 255 },
      { "id": "dev", "label": "DEV copy", "kind": "note", "sub": "a copy", "x": 210, "y": 255 },
      { "id": "medium", "label": "Medium copy", "kind": "note", "sub": "a copy", "x": 358, "y": 255 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "own", "to": "google", "label": "the article" },
      { "kind": "fly", "at": 1.5, "dur": 1.0, "from": "dev", "to": "google", "label": "a copy" },
      { "kind": "fly", "at": 2.7, "dur": 1.0, "from": "medium", "to": "google", "label": "a copy" },
      { "kind": "say", "at": 3.9, "actor": "google", "text": "shows one", "tone": "accent" },
      { "kind": "mark", "at": 3.9, "actor": "dev", "tone": "accent" },
      { "kind": "verdict", "at": 4.6, "text": "One version is shown, no penalty", "tone": "good" }
    ],
    "loop": 8.5
  }
}
```

## What the learner should notice
The copy that is shown may not be the original. That is why the original page carries a link home on every copy.
