---
artifact: canvas-spec
course: career-brand
chapter: "7.2"
beat: 5
slug: career-m7-experience-entry
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Experience: accurate, real, with proof

## Teaching claim
Name organisations accurately, list real professional ties, and put a ledger bullet and attached skills in each entry. The policy forbids misleading information about qualifications, experience or achievements.

## Why this visual
An Experience entry takes a bullet from the ledger and skills from the profile, and says only what is real.

## Data
LinkedIn's help pages (checked 2026-10): name organisations accurately and list real professional ties (employment, contract, internship, volunteer, board), not informal ones; skills can be attached to positions; up to 100 skills. Areej's redacted option, if she does not want the company name public, is "a parcel delivery company".

```json
{
  "title": "Experience: accurate, real, with proof",
  "purpose": "An Experience entry names a real tie accurately. A bullet from the claim ledger and the skills used are attached to it. Areej's entry can read 'a parcel delivery company' if she does not want the name public.",
  "limits": "Checked 2026-10; if your screen differs, follow your screen. Areej is a fictional fellow. An Arabic or second-language profile is optional and supported. Never list an informal tie as a job.",
  "hint": "A real tie, a ledger bullet, skills attached.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "entry", "label": "Experience", "kind": "note", "sub": "accurate name", "x": 210, "y": 105 },
      { "id": "bullet", "label": "Ledger bullet", "kind": "note", "sub": "from the ledger", "x": 62, "y": 250 },
      { "id": "skills", "label": "Skills", "kind": "note", "sub": "attached to it", "x": 358, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "bullet", "to": "entry", "label": "owned bullet" },
      { "kind": "fly", "at": 1.6, "dur": 1.0, "from": "skills", "to": "entry", "label": "skills attached" },
      { "kind": "say", "at": 2.8, "actor": "entry", "text": "real tie only", "tone": "good" },
      { "kind": "verdict", "at": 3.6, "text": "Accurate, real, with proof", "tone": "good" }
    ],
    "loop": 7.5
  }
}
```

## What the learner should notice
The entry's proof is the same bullet as on the resume, from the same ledger row.
