import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 24.4 beat 1 (One offer at a time)
export const sysdesignM24OfferOneDriver: SceneSpec = {
  kind: "scene",
  title: "Offer the ride to one driver, then the next",
  purpose: "Dispatch offers the ride to the nearest driver first. If that driver does not answer in 10 seconds, it offers the ride to the next one.",
  limits: "The 10 second limit and the order are course choices. Real services also weigh other things, such as how long a driver has waited.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      {
        id: "disp",
        label: "Dispatch",
        kind: "server",
        sub: "has a request",
        x: 70,
        y: 100
      },
      {
        id: "d1",
        label: "Driver 1",
        kind: "phone",
        sub: "nearest",
        x: 350,
        y: 100
      },
      {
        id: "d2",
        label: "Driver 2",
        kind: "phone",
        sub: "second nearest",
        x: 350,
        y: 230
      },
      {
        id: "rider",
        label: "Rider",
        kind: "phone",
        sub: "waiting",
        x: 70,
        y: 230
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 0.9,
        from: "disp",
        to: "d1",
        label: "offer, 10 s"
      },
      {
        kind: "say",
        at: 1.2,
        actor: "d1",
        text: "thinking",
        tone: "accent"
      },
      {
        kind: "say",
        at: 3,
        actor: "d1",
        text: "no answer",
        tone: "bad"
      },
      {
        kind: "fly",
        at: 3.4,
        dur: 1.1,
        from: "disp",
        to: "d2",
        label: "offer"
      },
      {
        kind: "say",
        at: 4.5,
        actor: "d2",
        text: "accepts",
        tone: "good"
      },
      {
        kind: "fly",
        at: 4.8,
        dur: 1.1,
        from: "d2",
        to: "disp",
        label: "yes",
        tone: "good"
      },
      {
        kind: "fly",
        at: 6,
        dur: 0.9,
        from: "disp",
        to: "rider",
        label: "car coming",
        tone: "good"
      },
      {
        kind: "say",
        at: 6.9,
        actor: "rider",
        text: "car coming",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 6.9,
        text: "One offer at a time, then the next",
        tone: "good"
      }
    ],
    loop: 10
  }
};
