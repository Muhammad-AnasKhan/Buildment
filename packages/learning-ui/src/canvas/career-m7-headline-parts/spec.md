---
artifact: canvas-spec
course: career-brand
chapter: "7.2"
beat: 2
slug: career-m7-headline-parts
kind: slot-card
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: Write a headline a stranger understands

## Teaching claim
A headline works when its first words say the role, the tools and what you do. Adjectives, "lifelong learner" and "open to opportunities" tell a stranger nothing.

## Why this visual
The slot card builds Amjad's new headline from three parts and refuses four of his old phrases. The assembled headline is the canon's worked example.

## Change from the module brief
The brief imagines choosing fragments on a profile picture. The slot card does the same with three slots and refusal reasons. The worked headline is Amjad's (canon, 7.2): "Freelance web developer (Laravel, WordPress). I fix slow client sites and show the numbers." No numbers are invented for him; the headline promises to show them. Areej's headline is in the fold: "Full-stack developer (Node.js, PostgreSQL). I make slow pages fast and measure it."

## Data
```json
{
  "title": "Write a headline a stranger understands",
  "purpose": "Build Amjad's new headline from three parts: his role, his tools and what he does. 'Passionate', 'lifelong learner', 'open to opportunities' and 'rockstar' are refused with a reason.",
  "limits": "Amjad is a fictional fellow. No character count is given: type your headline in the editor and read the counter on your own screen. Checked 2026-10. A headline is a summary of your About section, so write it last.",
  "config": {
    "cardTitle": "Amjad's new headline",
    "claim": "Passionate developer | Lifelong learner",
    "slots": [
      { "id": "role", "label": "Role" },
      { "id": "stack", "label": "Stack" },
      { "id": "habit", "label": "Proof habit" }
    ],
    "chips": [
      { "id": "role", "text": "Freelance web developer", "slot": "role", "why": "This is the role, in the first words." },
      { "id": "stack", "text": "(Laravel, WordPress)", "slot": "stack", "why": "This names the tools he uses." },
      { "id": "habit", "text": "I fix slow client sites and show the numbers", "slot": "habit", "why": "This says what he does and how he proves it." },
      { "id": "passionate", "text": "Passionate developer", "slot": null, "why": "An adjective. A stranger learns nothing." },
      { "id": "learner", "text": "Lifelong learner", "slot": null, "why": "Says nothing about what he does." },
      { "id": "open", "text": "Open to opportunities", "slot": null, "why": "Open to Work says this. Say what you do here." },
      { "id": "rockstar", "text": "Rockstar developer", "slot": null, "why": "A boast. Nobody can check it." }
    ],
    "assembled": "Freelance web developer (Laravel, WordPress). I fix slow client sites and show the numbers.",
    "hint": "Tap a chip, then the part it fills. Or drag the chip onto the part.",
    "endNote": "The first words now say what he does. No number is invented: the headline promises to show them."
  }
}
```

## What the learner should notice
The four refused phrases are the ones in his old headline. The accepted ones are shorter to read and say more.
