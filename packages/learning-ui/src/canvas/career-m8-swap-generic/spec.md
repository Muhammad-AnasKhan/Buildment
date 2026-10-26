---
artifact: canvas-spec
course: career-brand
chapter: "8.4"
beat: 3
slug: career-m8-swap-generic
kind: slot-card
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: Swap generic for specific

## Teaching claim
Make a site yours by putting a specific in each place a template puts a generic: a real screenshot for a stock photo, your own line for a slogan, dates on posts, a number with its source, and an honest mistake.

## Why this visual
The slot card builds Areej's home page from five specific parts and refuses four generic ones, each with a reason.

## Change from the module brief
The brief imagines toggling site elements between generic and specific with a meter. The slot card does the same: the "checkable parts: N of 5" counter is the meter. The football notebook line is left out on purpose, because the canon limits it to one use in her About section (7.5).

## Data
Areej's home page is from the canon: the USP line, two proofs, no template stock photos, real screenshots and dates. The honest mistake is her post's "what she would change": she tested only on seeded data, not on a copy of production data.

```json
{
  "title": "Swap generic for specific",
  "purpose": "Build Areej's home page from five specifics: a real screenshot, her own line, dates, a number and an honest mistake. A stock photo, a slogan, hidden dates and a humaniser are refused with a reason.",
  "limits": "A real home page has more than five parts. Her numbers are illustrative. Detectors misjudge second-language English, so beating one is not a goal.",
  "config": {
    "cardTitle": "Areej's home page",
    "claim": "A page that could be anyone's",
    "slots": [
      { "id": "photo", "label": "Photo" },
      { "id": "intro", "label": "Intro line" },
      { "id": "dates", "label": "Dates" },
      { "id": "number", "label": "A number" },
      { "id": "mistake", "label": "A mistake" }
    ],
    "chips": [
      { "id": "photo", "text": "A real screenshot of the dashboard", "slot": "photo", "why": "Real screenshots show real work." },
      { "id": "intro", "text": "I measure before and after, and write it down", "slot": "intro", "why": "This is her own line, in her own words." },
      { "id": "dates", "text": "Every post has a date", "slot": "dates", "why": "Dates show when it was true." },
      { "id": "number", "text": "p95 820 ms to 95 ms, same test", "slot": "number", "why": "A number with its test, which a reader can check." },
      { "id": "mistake", "text": "I tested only on seeded data (made up on purpose), not production data", "slot": "mistake", "why": "An honest limit makes the rest believable." },
      { "id": "stock", "text": "A stock photo of a laptop", "slot": null, "why": "A stock photo says nothing about you." },
      { "id": "slogan", "text": "I am passionate and love solving problems", "slot": null, "why": "The template line. Anyone could write it." },
      { "id": "nodates", "text": "No dates, so it never looks old", "slot": null, "why": "No date hides when it was true." },
      { "id": "humaniser", "text": "Run the text through a humaniser", "slot": null, "why": "It changes style, not facts." }
    ],
    "assembled": "A real screenshot of the dashboard. I measure before and after, and write it down. Every post has a date. p95 820 ms to 95 ms, same test. I tested only on seeded data (made up on purpose), not production data.",
    "hint": "Tap a chip, then the part it fills. Or drag the chip onto the part.",
    "endNote": "Each part is something only the writer could add. The generic ones are easy to write and tell a visitor nothing."
  }
}
```

## What the learner should notice
The accepted chips are plainer than the refused ones. They are also the only ones a visitor can check.
