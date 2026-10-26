---
artifact: canvas-spec
course: career-brand
chapter: "8.3"
beat: 4
slug: career-m8-channel-versions
kind: sorter
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: Map eight of your channels

## Teaching claim
Each channel gets the version that suits it: a full copy with a canonical link, a short version with a link, or a link on its own. Every copy has a way back to your page.

## Why this visual
The sorter turns Areej's channel plan into a choice per channel and refuses a full article in a chat or a bare link where a short answer is expected.

## Change from the module brief
The brief imagines dragging channels onto a map. The sorter keeps the decision (which version for which channel) with three buckets and eight of Areej's ten channels. The two left out (her own site first, and her cohort chat) are in the table in the chapter. Which ten is open decision 19.

## Data
Areej's ten channels are from the canon: her own site first (the original); DEV with canonical_url; Medium with "originally published elsewhere"; a short LinkedIn post linking to the original; LinkedIn Featured; the Campus Board repository README; her GitHub profile README; the coding club's group chat (with the organisers' agreement); her fellows' cohort chat; a public forum thread about load testing, where links are allowed (this replaces the canon's private message to her former teaching assistant, which belongs to module 7). Each copy carries "First published at [her site]". Try each platform on your phone before the gate.

```json
{
  "title": "Map eight of your channels",
  "purpose": "Sort eight of Areej's channels into the version each gets: a full copy with a canonical link, a short version with a link, or a link only. A short reason follows each wrong try.",
  "limits": "Checked 2026-10; platform settings change, and access from where you are to DEV, Medium and others is not confirmed, so try each on your phone. Which channels you use is your choice.",
  "config": {
    "buckets": [
      { "id": "full", "label": "Full copy", "sub": "with a canonical link" },
      { "id": "short", "label": "Short + link", "sub": "a few lines, link home" },
      { "id": "link", "label": "Link only", "sub": "one line and the URL" }
    ],
    "cards": [
      { "id": "dev", "text": "DEV, with the canonical_url field set", "answer": "full", "why": { "short": "DEV can hold the whole article.", "link": "DEV is a full article page." } },
      { "id": "medium", "text": "Medium, with 'originally published elsewhere' set", "answer": "full", "why": { "short": "Medium can hold the whole article.", "link": "Medium is a full article page." } },
      { "id": "linkedin-post", "text": "A short LinkedIn post that ends with your link", "answer": "short", "why": { "full": "A LinkedIn post is short. It is not the article.", "link": "A post can say more than a bare link." } },
      { "id": "featured", "text": "LinkedIn Featured", "answer": "link", "why": { "full": "Featured holds an item, not a copy of the article.", "short": "Featured shows an item, not a text post." } },
      { "id": "repo", "text": "The Campus Board repository README", "answer": "link", "why": { "full": "A README is not the place for the whole article.", "short": "One line and the link is enough." } },
      { "id": "profile-readme", "text": "Your GitHub profile README", "answer": "short", "why": { "full": "A profile README is a few lines, not the article.", "link": "A few lines of intro make it worth a click." } },
      { "id": "club-chat", "text": "The coding club's group chat, with the organisers' agreement", "answer": "link", "why": { "full": "A chat is no place for an article.", "short": "A chat wants one line and the link." } },
      { "id": "forum", "text": "A public forum thread about load testing, where links are allowed", "answer": "short", "why": { "full": "A forum answer is short. It is not the whole article.", "link": "A bare link is not an answer. Give a few lines first." } }
    ],
    "deckLabel": "Channel",
    "prompt": "Which version goes here?",
    "hint": "Tap the version this channel gets, or drag the card onto it.",
    "endNote": "Each channel gets the version that suits it, and every copy has a way back to your page: a canonical link or a 'first published at' line."
  }
}
```

## What the learner should notice
Only two channels get the whole article. Most get a line and a link, and every one of them points back to the original.
