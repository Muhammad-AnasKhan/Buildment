import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 27.2 beat 3: The upload bytes go straight to storage with a signed address.
export const sysdesignM27BytesBypass: SceneSpec = {
  kind: "scene",
  title: "The bytes skip the API servers",
  purpose: "Lina's phone asks the API for permission and gets a signed address. It sends the 300 MB file straight to storage, so the API only sees two small requests and a finished note.",
  limits: "Lamha is made up. The signed address is the idea from chapter 5.7: it works for one upload and expires. The picture leaves out the chunking (chapter 27.3) and the checks the pipeline runs later on the file.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "300 MB video", x: 70, y: 100 },
      { id: "api", label: "API", kind: "server", sub: "tiny requests", x: 350, y: 100 },
      { id: "store", label: "Storage", kind: "database", sub: "raw uploads", x: 210, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "phone", to: "api", label: "start upload" },
      { kind: "fly", at: 1.1, dur: 0.8, from: "api", to: "phone", label: "signed address" },
      { kind: "say", at: 1.9, actor: "api", text: "no video here", tone: "good" },
      { kind: "fly", at: 2.2, dur: 1.6, from: "phone", to: "store", label: "300 MB in chunks" },
      { kind: "say", at: 3.8, actor: "store", text: "got 300 MB", tone: "good" },
      { kind: "fly", at: 4.0, dur: 0.8, from: "store", to: "api", label: "upload done" },
      { kind: "say", at: 4.8, actor: "api", text: "job queued", tone: "accent" },
      { kind: "verdict", at: 5.0, text: "Bytes skip the API servers", tone: "good" },
    ],
    loop: 8,
  },
};
