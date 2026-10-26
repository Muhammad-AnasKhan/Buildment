---
artifact: canvas-spec
course: career-brand
chapter: "3.2"
beat: 3
slug: career-m3-claim-card
kind: slot-card
playable: true
status: existing slug, data revised
version: 2
owner: interaction-designer
---

# Canvas spec: Fill the claim card

## Teaching claim
A number becomes a claim a reader can check only when it has its parts: what was measured, before, after, over what window, from what source, and who did what. A number that belongs to the whole team is not yours alone.

## Why this visual
The slot card makes the learner place each part and refuses a feeling, a tool's guess and the team's bigger number.

## Revision of the existing data
The data in `packages/learning-ui/src/canvas/career-m3-claim-card/data.ts` fills Tawfiq's card with "50 to 15 minutes, median of 14 nights" and "about 70 percent". The canon (`module-briefs/00-areej-and-cast.md`, scene 3.1) says: the whole pipeline went from 5 hours to 1.5 hours (70 percent) the week the platform team moved it to larger machines, and his own rewritten join step went from 50 to 20 minutes, which he can show from the job logs. There is no 14 nights or 15 minutes in the canon. The module brief's predict and its honest card ("his join step, 50 to 20 minutes, from the job logs; the 70 percent belongs to the whole team and the bigger machines") need the card to refuse the team's 70 percent. Replace the data with the version below. The slot card holds at most six slots, so the seventh field of the brief, "what else changed", is carried by beat 4 (`career-m3-what-else-changed`) and shown in the "Your share" chip.

## Data
```json
{
  "title": "Fill the claim card",
  "purpose": "Fill Tawfiq's claim card (metric, before, after, window, source, your share) from snippets; a feeling, a tool's guess and the team's 70 percent are refused with a reason, and the finished card reads as one checkable sentence.",
  "limits": "A real claim card can need more parts, such as what else changed in the same weeks (the next picture). The window here is described, not counted, because the canon gives no number of nights. Tawfiq, his team and the numbers are fictional and illustrative.",
  "config": {
    "cardTitle": "Tawfiq's claim card",
    "claim": "Made the nightly pipeline 70 percent faster",
    "slots": [
      { "id": "metric", "label": "Metric" },
      { "id": "before", "label": "Before" },
      { "id": "after", "label": "After" },
      { "id": "window", "label": "Window" },
      { "id": "source", "label": "Source" },
      { "id": "share", "label": "Your share" }
    ],
    "chips": [
      { "id": "metric", "text": "Run time of the join step in the nightly run", "slot": "metric", "why": "This names what was measured: the Metric." },
      { "id": "before", "text": "50 minutes", "slot": "before", "why": "This is the run time before the change." },
      { "id": "after", "text": "20 minutes", "slot": "after", "why": "This is the run time after the change." },
      { "id": "window", "text": "The nights before and after my change", "slot": "window", "why": "This says how long it was measured: the Window." },
      { "id": "source", "text": "The nightly job logs", "slot": "source", "why": "This says where the numbers come from: the Source." },
      { "id": "share", "text": "I rewrote the join step; new machines helped", "slot": "share", "why": "This says who did what: Your share." },
      { "id": "team-number", "text": "70 percent, 5 hours down to 1.5 hours", "slot": null, "why": "New machines helped too. It is not only his." },
      { "id": "felt", "text": "It felt much faster", "slot": null, "why": "A feeling is not a measurement." },
      { "id": "ai-estimate", "text": "About 70 percent, the AI estimated", "slot": null, "why": "A tool's guess is not a source." }
    ],
    "assembled": "Cut the run time of the join step in the nightly run from 50 to 20 minutes (nightly job logs, the nights before and after my change); I rewrote the join step, and new machines helped the whole run that week.",
    "hint": "Tap a chip, then the slot it fills. Or drag the chip onto the slot.",
    "endNote": "The 70 percent was real for the whole run. This card claims only what the logs show was his, and names the help."
  }
}
```

## What the learner should notice
The 70 percent never goes on his card, and it is not wrong. It belongs to the whole team and the new machines. What he can claim, with its parts, is smaller and checkable.
