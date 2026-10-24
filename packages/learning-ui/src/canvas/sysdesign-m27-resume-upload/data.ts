import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 27.3 beat 1: A dropped connection resumes from the first missing chunk.
export const sysdesignM27ResumeUpload: SceneSpec = {
  kind: "scene",
  title: "A dropped connection resumes, not restarts",
  purpose: "A phone sends a 300 MB file in 8 MB chunks. The connection drops before chunk 3. When it returns, the phone asks the server which chunks it has and sends chunk 3 onward. Chunks 1 and 2 are never sent again.",
  limits: "Lamha is made up. 8 MB chunks and 38 chunks for 300 MB are course numbers. The picture shows three chunks; a real upload also checks each chunk with a checksum and may send several at once on a fast connection.",
  scene: {
    width: 420,
    height: 310,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "8 MB chunks", x: 70, y: 110 },
      { id: "server", label: "Upload", kind: "server", sub: "saves chunks", x: 350, y: 110 },
    ],
    strip: { y: 272, from: 0, to: 4, unit: "", caption: "chunk number", every: 1 },
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "phone", to: "server", label: "chunk 1" },
      { kind: "tag", at: 0.9, row: 0, value: 1, label: "chunk 1", tone: "good" },
      { kind: "fly", at: 1.0, dur: 0.7, from: "phone", to: "server", label: "chunk 2" },
      { kind: "tag", at: 1.7, row: 0, value: 2, label: "chunk 2", tone: "good" },
      { kind: "say", at: 2.0, actor: "phone", text: "offline", tone: "bad" },
      { kind: "mark", at: 2.0, actor: "phone", tone: "bad" },
      { kind: "tag", at: 2.0, row: 0, value: 3, label: "chunk 3", tone: "warn" },
      { kind: "say", at: 3.2, actor: "phone", text: "back online", tone: "good" },
      { kind: "fly", at: 3.4, dur: 0.7, from: "phone", to: "server", label: "which chunks?" },
      { kind: "fly", at: 4.2, dur: 0.7, from: "server", to: "phone", label: "chunks 1, 2" },
      { kind: "fly", at: 5.0, dur: 0.7, from: "phone", to: "server", label: "chunk 3" },
      { kind: "retone", at: 5.7, label: "chunk 3", tone: "good" },
      { kind: "say", at: 5.7, actor: "server", text: "has 1 to 3", tone: "good" },
      { kind: "verdict", at: 5.9, text: "Resume at chunk 3, not chunk 1", tone: "good" },
    ],
    loop: 9,
  },
};
