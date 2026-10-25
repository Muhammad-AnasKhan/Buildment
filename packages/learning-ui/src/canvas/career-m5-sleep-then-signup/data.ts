import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 5, chapter 5.1 beat 2: A minute to wake, then a sign-up.
// Moath's demo is asleep on a free plan, then asks for a sign-up; the founder closes the tab.

export const careerM5SleepThenSignup: SceneSpec = {
  kind: "scene",
  title: "A minute to wake, then a sign-up",
  purpose: "The founder opens Moath's demo link. The free service is asleep and takes about a minute to wake. Then a sign-up form asks for an email confirmation. The founder closes the tab.",
  limits: "Moath is a fictional fellow. Free plans differ and change their rules. Checked 2026-10; check before you rely on it, and trust your own screen. The wait counts up to about a minute only for the story. No number is given for how long a founder waits.",
  hint: "Two obstacles, one after the other.",
  scene: {
    width: 420,
    height: 340,
    actors: [
      {
        id: "founder",
        label: "Founder",
        kind: "user",
        sub: "opens demo",
        x: 358,
        y: 110
      },
      {
        id: "demo",
        label: "Demo link",
        kind: "server",
        sub: "asleep",
        x: 62,
        y: 250
      },
      {
        id: "form",
        label: "Sign-up form",
        kind: "note",
        sub: "email needed",
        x: 358,
        y: 250
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 1,
        from: "founder",
        to: "demo",
        label: "open demo"
      },
      {
        kind: "wait",
        at: 1.5,
        dur: 2.5,
        actor: "demo",
        label: "waking {n} s",
        doneLabel: "awake",
        total: 60
      },
      {
        kind: "fly",
        at: 4.3,
        dur: 1,
        from: "demo",
        to: "form",
        label: "sign up"
      },
      {
        kind: "say",
        at: 5.4,
        actor: "form",
        text: "confirm email",
        tone: "warn"
      },
      {
        kind: "say",
        at: 6,
        actor: "founder",
        text: "closes the tab",
        tone: "bad"
      },
      {
        kind: "verdict",
        at: 6.6,
        text: "Asleep, then a sign-up wall",
        tone: "bad"
      }
    ],
    loop: 10
  },
};
