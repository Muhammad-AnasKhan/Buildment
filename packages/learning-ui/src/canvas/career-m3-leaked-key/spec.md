---
artifact: canvas-spec
course: career-brand
chapter: "3.3"
beat: 3
slug: career-m3-leaked-key
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Security proof shows the fix, not the secret

## Teaching claim
Never put a real key in your code. If a key was ever pushed, assume it is stolen and replace it. Proof of a security fix is the revocation and the protection setting, never the key itself.

## Why this visual
Three steps in order (found, replaced, prevented) with the key itself hidden make "show the fix, not the secret" concrete.

## Data
The story is from the canon (Campus Board, the leaked key). Deleting a file does not remove a pushed key from history; restarting an app does not revoke a stolen credential; push protection blocks known formats before a push but does not undo an earlier leak. Areej is a fictional fellow.

```json
{
  "title": "Security proof shows the fix, not the secret",
  "purpose": "Areej finds an email-service key in an early commit. She revokes it and makes a new one, moves secrets to environment variables with an example file, and turns on push protection. The key itself is never shown.",
  "limits": "Areej is a fictional fellow. Deleting the file would not have removed the key from the history. Push protection blocks known key formats before a push; it does not undo an earlier leak. Checked 2026-10; trust your own screen over any list.",
  "hint": "Found, replaced, prevented.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "found", "label": "Found", "kind": "note", "sub": "key in history", "x": 62, "y": 110 },
      { "id": "replaced", "label": "Replaced", "kind": "note", "sub": "old key revoked", "x": 358, "y": 110 },
      { "id": "prevented", "label": "Prevented", "kind": "note", "sub": "next time", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "say", "at": 0.5, "actor": "found", "text": "key: hidden", "tone": "warn" },
      { "kind": "fly", "at": 1.2, "dur": 1.1, "from": "found", "to": "replaced", "label": "revoked, replaced" },
      { "kind": "say", "at": 2.4, "actor": "replaced", "text": "new key in env", "tone": "good" },
      { "kind": "fly", "at": 3.0, "dur": 1.1, "from": "replaced", "to": "prevented", "label": ".env.example" },
      { "kind": "say", "at": 4.2, "actor": "prevented", "text": "protection on", "tone": "good" },
      { "kind": "verdict", "at": 4.9, "text": "Show the fix, not the secret", "tone": "good" }
    ],
    "loop": 8.5
  }
}
```

## What the learner should notice
The proof is three facts anyone can check: the old key stopped working, secrets live in the environment, and the setting is on. None of them is the key.
