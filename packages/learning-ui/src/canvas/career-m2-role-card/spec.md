---
artifact: canvas-spec
course: career-brand
chapter: "2.3"
beat: 2
slug: career-m2-role-card
kind: slot-card
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: Fill the role card

## Teaching claim
A role is more than a title. Its card holds the situation, what you did, what the team did, the result, where the proof lives, and whether you may show it.

## Why this visual
The slot card makes the learner place each fact in its field. A skill word, a number that credits the wrong cause and a boast fit no field and are refused with a reason. Its slots are the same fields the 2.5 template uses.

## Data
Areej's volunteer role at the youth coding club (canon). Her volunteer card is as full as her internship card. Areej is a fictional fellow and her numbers are illustrative.

```json
{
  "title": "Fill the role card",
  "purpose": "Fill Areej's volunteer role card (situation, what I did, what the team did, result, proof, may I show it) from snippets; a skill word, a boast and a number that credits the wrong cause are refused with a reason.",
  "limits": "A real role card can have more fields. The numbers come from Areej's notes and are illustrative. 'Where the proof lives' may honestly be 'unknown' until module 3. Areej and the club are fictional.",
  "config": {
    "cardTitle": "Areej's volunteer card",
    "claim": "Sign-up migration for the coding club",
    "slots": [
      { "id": "situation", "label": "Situation" },
      { "id": "did", "label": "I did" },
      { "id": "team", "label": "Team did" },
      { "id": "result", "label": "Result" },
      { "id": "proof", "label": "Proof" },
      { "id": "show", "label": "May I show?" }
    ],
    "chips": [
      { "id": "situation", "text": "Sign-ups were in three shared spreadsheets", "slot": "situation", "why": "This is where things stood before: the Situation." },
      { "id": "did", "text": "Built a web form and database; moved the old data", "slot": "did", "why": "This is what Areej did herself: I did." },
      { "id": "team", "text": "Organisers chose the fields and tested it", "slot": "team", "why": "This is what the others did: Team did." },
      { "id": "result", "text": "412 rows, 57 duplicates, 355 imported; clashes 9 to 1", "slot": "result", "why": "This is what changed, in numbers: the Result." },
      { "id": "proof", "text": "Row counts per session; clash count from the group chat", "slot": "proof", "why": "This says where the numbers can be checked." },
      { "id": "show", "text": "Numbers only. No names or sign-up data", "slot": "show", "why": "This says what may be shown in public." },
      { "id": "skill", "text": "Great at databases", "slot": null, "why": "A skill word is not a result." },
      { "id": "form-credit", "text": "Double bookings fell 9 to 1, thanks to the form", "slot": null, "why": "Sessions also went from three to two a week." },
      { "id": "led", "text": "I led the whole club", "slot": null, "why": "She was one organiser on a team." }
    ],
    "assembled": "Sign-ups were in three shared spreadsheets. I built a web form and database and moved the old data; the organisers chose the fields and tested it. 412 rows, 57 duplicates, 355 imported; clashes fell from 9 to 1, but sessions also dropped from three to two a week. Proof: row counts per session and the group chat count. In public: numbers only, no names.",
    "hint": "Tap a chip, then the field it fills. Or drag the chip onto the field.",
    "endNote": "Every field now holds something a reader can ask about, and the caveat about fewer sessions is part of the honest card."
  }
}
```

## What the learner should notice
The boast and the skill word are the easiest to write and fit nowhere. The caveat ("sessions also dropped") is part of the card, not a weakness.

## Limits
In the `limits` field of the data.
