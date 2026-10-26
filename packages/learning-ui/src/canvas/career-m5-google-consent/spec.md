---
artifact: canvas-spec
course: career-brand
chapter: "5.3"
beat: 2
slug: career-m5-google-consent
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Sign in with Google, smallest request

## Teaching claim
If your app asks Google only for name, email address and profile picture, there is no test-user list, no warning screen and no expiry. Ask for the smallest request.

## Why this visual
A sign-in request goes to Google and three items come back. The consent screen shows nothing else.

## Data
Based on Google's identity documentation (checked 2026-10; verify before publish): sign-in returns an ID token, and signing in is separate from asking for Google data later; new web apps should enable FedCM. In testing, up to 100 test users can be listed and authorisations expire after 7 days, except when the app asks only for name, email and profile. OAuth 2.0 means the app never sees the Google password.

```json
{
  "title": "Sign in with Google, smallest request",
  "purpose": "Your app asks Google to sign someone in. Google returns only a name, an email address and a profile picture. The consent screen has no warning and no test-user list.",
  "limits": "Checked 2026-10; check before you rely on it, and trust your own screen. Whether this set-up works from your location is not verified: test it early and ask your mentor, and never use a VPN. A request for more than these three items brings the limits back.",
  "hint": "Ask for three things and nothing more.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "app", "label": "Your app", "kind": "phone", "sub": "signs people in", "x": 62, "y": 110 },
      { "id": "google", "label": "Google", "kind": "server", "sub": "sign-in", "x": 358, "y": 110 },
      { "id": "consent", "label": "Consent", "kind": "note", "sub": "3 items only", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "app", "to": "google", "label": "sign in" },
      { "kind": "fly", "at": 1.6, "dur": 1.0, "from": "google", "to": "app", "label": "name, email, photo" },
      { "kind": "say", "at": 2.8, "actor": "consent", "text": "no warning", "tone": "good" },
      { "kind": "say", "at": 3.4, "actor": "consent", "text": "no test list", "tone": "good" },
      { "kind": "verdict", "at": 4.2, "text": "Ask for the smallest request", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
The smallest request is also the one with the fewest obstacles for the people trying your app.
