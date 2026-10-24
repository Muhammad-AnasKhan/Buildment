import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 24.1 beat 1 (One tap, one search, one match)
export const sysdesignM24RequestARide: SceneSpec = {
  kind: "scene",
  title: "One tap becomes a search and a match",
  purpose: "A rider taps Request. Safar asks the driver map who is near, picks one driver and sends an offer. The driver accepts and the rider is told.",
  limits: "Safar is a made-up service. The picture hides how the map is built and how the driver is chosen: the rest of the module is about those two parts.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      {
        id: "rider",
        label: "Rider",
        kind: "phone",
        sub: "taps Request",
        x: 70,
        y: 100
      },
      {
        id: "safar",
        label: "Safar",
        kind: "server",
        sub: "ride service",
        x: 350,
        y: 100
      },
      {
        id: "map",
        label: "Driver map",
        kind: "cache",
        sub: "who is near?",
        x: 350,
        y: 230
      },
      {
        id: "driver",
        label: "Driver",
        kind: "phone",
        sub: "online",
        x: 70,
        y: 230
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 0.9,
        from: "rider",
        to: "safar",
        label: "Request ride"
      },
      {
        kind: "say",
        at: 1.2,
        actor: "safar",
        text: "asks the map",
        tone: "accent"
      },
      {
        kind: "fly",
        at: 1.5,
        dur: 0.9,
        from: "safar",
        to: "map",
        label: "near here?"
      },
      {
        kind: "say",
        at: 2.4,
        actor: "map",
        text: "12 drivers",
        tone: "good"
      },
      {
        kind: "fly",
        at: 2.7,
        dur: 0.9,
        from: "map",
        to: "safar",
        label: "12 drivers"
      },
      {
        kind: "say",
        at: 3.6,
        actor: "safar",
        text: "picks one",
        tone: "accent"
      },
      {
        kind: "fly",
        at: 3.9,
        dur: 1,
        from: "safar",
        to: "driver",
        label: "offer"
      },
      {
        kind: "say",
        at: 4.9,
        actor: "driver",
        text: "accepts",
        tone: "good"
      },
      {
        kind: "fly",
        at: 5.2,
        dur: 1,
        from: "driver",
        to: "safar",
        label: "yes"
      },
      {
        kind: "fly",
        at: 6.3,
        dur: 0.9,
        from: "safar",
        to: "rider",
        label: "car coming",
        tone: "good"
      },
      {
        kind: "say",
        at: 7.2,
        actor: "rider",
        text: "car on its way",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 7.2,
        text: "One tap, one search, one match",
        tone: "good"
      }
    ],
    loop: 10.5
  }
};
