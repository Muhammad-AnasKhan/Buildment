import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 5, chapter 5.3 beat 2: Sign in with Google, smallest request.
// Sign in with Google asking only for name, email and profile picture (checked 2026-10).

export const careerM5GoogleConsent: SceneSpec = {
  kind: "scene",
  title: "Sign in with Google, smallest request",
  purpose: "Your app asks Google to sign someone in. Google returns only a name, an email address and a profile picture. The consent screen has no warning and no test-user list.",
  limits: "Checked 2026-10; check before you rely on it, and trust your own screen. Whether this set-up works from your location is not verified: test it early and ask your mentor, and never use a VPN. A request for more than these three items brings the limits back.",
  hint: "Ask for three things and nothing more.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      {
        id: "app",
        label: "Your app",
        kind: "phone",
        sub: "signs people in",
        x: 62,
        y: 110
      },
      {
        id: "google",
        label: "Google",
        kind: "server",
        sub: "sign-in",
        x: 358,
        y: 110
      },
      {
        id: "consent",
        label: "Consent",
        kind: "note",
        sub: "3 items only",
        x: 210,
        y: 250
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 1,
        from: "app",
        to: "google",
        label: "sign in"
      },
      {
        kind: "fly",
        at: 1.6,
        dur: 1,
        from: "google",
        to: "app",
        label: "name, email, photo"
      },
      {
        kind: "say",
        at: 2.8,
        actor: "consent",
        text: "no warning",
        tone: "good"
      },
      {
        kind: "say",
        at: 3.4,
        actor: "consent",
        text: "no test list",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 4.2,
        text: "Ask for the smallest request",
        tone: "good"
      }
    ],
    loop: 8
  },
};
