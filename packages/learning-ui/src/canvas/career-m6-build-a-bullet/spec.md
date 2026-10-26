---
artifact: canvas-spec
course: career-brand
chapter: "6.3"
beat: 2
slug: career-m6-build-a-bullet
kind: slot-card
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: Build a bullet from a claim card

## Teaching claim
A bullet says what you owned, what changed with its before and after, the window, how, and what part was yours. A vague duty, an unsupported percentage and an empty phrase fit none of those.

## Why this visual
The slot card turns Areej's claim card into her resume bullet one part at a time, and refuses her old bullets for what they lack.

## Change from the module brief
The brief names seven parts (verb, what I owned, before and after, window, source, how, my share). The slot card holds six slots at most, so the verb joins the thing owned, before and after are one slot, and the source stays in the ledger (the bracket carries only the window). That leaves five slots: Owned, Change, Window, How, My share.

## Data
The bullet is Areej's first sample bullet from the canon, exactly. The three refused chips are her old resume lines.

```json
{
  "title": "Build a bullet from a claim card",
  "purpose": "Fill Areej's resume bullet (owned, change, window, how, my share) from snippets of her claim card. Her old lines, 'worked on backend performance', 'improved speed by 90%' and an empty phrase, are refused with a reason.",
  "limits": "A real bullet may need a source in brackets and a shorter wording for a one-page resume. The numbers are from Areej's notes and are illustrative.",
  "config": {
    "cardTitle": "Areej's resume bullet",
    "claim": "Worked on backend performance",
    "slots": [
      { "id": "owned", "label": "Owned" },
      { "id": "change", "label": "Change" },
      { "id": "window", "label": "Window" },
      { "id": "how", "label": "How" },
      { "id": "share", "label": "My share" }
    ],
    "chips": [
      { "id": "owned", "text": "Cut the p95 of a daily orders report", "slot": "owned", "why": "This is what she owned, with a strong verb." },
      { "id": "change", "text": "from 4.6 s to 0.41 s", "slot": "change", "why": "This is the change: the before and the after." },
      { "id": "window", "text": "(14 days before and after)", "slot": "window", "why": "This says how long it was measured: the Window." },
      { "id": "how", "text": "by finding a full-table scan and adding a composite index", "slot": "how", "why": "This says how she did it." },
      { "id": "share", "text": "my lead reviewed and scheduled the release", "slot": "share", "why": "This says the team's part, so hers is believable." },
      { "id": "worked-on", "text": "Worked on backend performance", "slot": null, "why": "No change, no number, no window." },
      { "id": "ninety", "text": "Improved speed by 90%", "slot": null, "why": "90 percent of what, over which days?" },
      { "id": "leveraging", "text": "Leveraging cutting-edge technologies", "slot": null, "why": "An empty phrase. Nothing to check." }
    ],
    "assembled": "Cut the p95 of a daily orders report from 4.6 s to 0.41 s (14 days before and after) by finding a full-table scan and adding a composite index; my lead reviewed and scheduled the release.",
    "hint": "Tap a chip, then the part it fills. Or drag the chip onto the part.",
    "endNote": "A reader can now ask how it was measured and what her part was, and every answer is already in the bullet or the ledger."
  }
}
```

## What the learner should notice
The three refused chips are Areej's own old lines. The accepted ones are longer, and each can be checked.
