---
artifact: canvas-spec
course: career-brand
chapter: "6.2"
beat: 5
slug: career-m6-plain-file
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: A plain file a program can read

## Teaching claim
Send a simple file a program can read: text you can select, normal headings and a standard format. An image-only file can fail to import.

## Why this visual
Two files go to one import tool. The one with selectable text is read; the one that is a picture is not.

## Data
Based on one applicant tracking system's help pages (checked 2026-10): a resume may fail to import with too little information, a non-standard file type or characters the parser cannot read; accepted uploads include .doc, .docx, PDF, RTF and text up to 100 MB; employers who want portfolios should ask for a link. Put links as plain text as well as clickable.

```json
{
  "title": "A plain file a program can read",
  "purpose": "An import tool reads a Word or PDF file with selectable text. It cannot read an image-only file. Put your links as plain text as well as clickable.",
  "limits": "One system's help pages, checked 2026-10; other systems differ, and trust your own screen. The picture does not say any employer's tool will fail on a pretty layout, only that selectable text is the safe choice.",
  "hint": "Selectable text, or a picture.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "file", "label": "Word or PDF", "kind": "note", "sub": "selectable text", "x": 62, "y": 110 },
      { "id": "image", "label": "Image-only", "kind": "note", "sub": "no text inside", "x": 358, "y": 110 },
      { "id": "tool", "label": "Import tool", "kind": "server", "sub": "reads text", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "file", "to": "tool", "label": "readable text" },
      { "kind": "say", "at": 1.4, "actor": "tool", "text": "imported", "tone": "good" },
      { "kind": "fly", "at": 2.6, "dur": 1.0, "from": "image", "to": "tool", "label": "a picture" },
      { "kind": "say", "at": 3.7, "actor": "tool", "text": "cannot read it", "tone": "bad" },
      { "kind": "verdict", "at": 4.4, "text": "Send a file a program can read", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
Both files may look identical to a person. Only one has text a program can use.
