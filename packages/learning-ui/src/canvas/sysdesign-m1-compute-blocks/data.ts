import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Beat 3 of 1.3: compute. The app server saves the upload and replies at
// once; the slow preview job goes to a worker. The 3 s is illustrative.
export const sysdesignM1ComputeBlocks: SceneSpec = {
  kind: "scene",
  title: "Compute: the app replies now, a worker does slow work",
  purpose: "The app server saves the PDF and says saved at once; a worker spends about 3 seconds making the preview.",
  limits: "The 3 second preview time is illustrative. The job goes straight to the worker here; in a real system it waits in a queue (next picture), so it is not lost if the worker is busy or restarts.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "student", label: "Student", kind: "user", sub: "has a PDF", x: 70, y: 110 },
      { id: "app", label: "App", kind: "server", sub: "quick work", x: 260, y: 110 },
      { id: "worker", label: "Worker", kind: "worker", sub: "idle", x: 260, y: 228 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 0.8, from: "student", to: "app", label: "upload PDF" },
      { kind: "say", at: 0.8, actor: "app", text: "file saved", tone: "good" },
      { kind: "fly", at: 0.9, dur: 0.7, from: "app", to: "student", label: "saved", tone: "good" },
      { kind: "say", at: 1.6, actor: "student", text: "can go on", tone: "good" },
      { kind: "fly", at: 1.0, dur: 0.7, from: "app", to: "worker", label: "job: preview" },
      { kind: "say", at: 1.7, actor: "worker", text: "making preview", tone: "warn" },
      { kind: "wait", at: 1.7, dur: 3.0, actor: "worker", label: "{n} s", doneLabel: "took 3 s", total: 3 },
      { kind: "say", at: 4.7, actor: "worker", text: "preview ready", tone: "good" },
      { kind: "verdict", at: 4.9, text: "Fast reply now, slow work later", tone: "good" },
    ],
    loop: 7.9,
  },
};
