import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Beat 4 of 1.3: data. One page view touches four homes for data: the cache
// (miss, then keep a copy), the database (the source of truth), object
// storage (the PDF file) and the queue (a job for later).
export const sysdesignM1DataBlocks: SceneSpec = {
  kind: "scene",
  title: "Data: four places, four jobs",
  purpose: "To show note 42, the app misses the cache, reads the database, keeps a copy in the cache, fetches the PDF from object storage and leaves a job in the queue.",
  limits: "One app server stands for many. The cache starts empty; a second view of note 42 would be answered by the cache. Real systems often add replicas of the database and the cache, which modules 5 and 8 cover.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "app", label: "App", kind: "server", sub: "show note 42", x: 210, y: 175 },
      { id: "cache", label: "Cache", kind: "cache", sub: "fast copies", x: 60, y: 95 },
      { id: "db", label: "Database", kind: "database", sub: "source of truth", x: 60, y: 255 },
      { id: "files", label: "Files", kind: "database", sub: "object storage", x: 360, y: 95 },
      { id: "queue", label: "Queue", kind: "queue", sub: "jobs for later", x: 360, y: 255 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 0.6, from: "app", to: "cache", label: "note 42?" },
      { kind: "say", at: 0.6, actor: "cache", text: "miss", tone: "warn" },
      { kind: "fly", at: 0.7, dur: 0.6, from: "cache", to: "app", label: "miss", tone: "warn" },

      { kind: "fly", at: 1.4, dur: 0.6, from: "app", to: "db", label: "read note 42" },
      { kind: "say", at: 2.0, actor: "db", text: "row found", tone: "good" },
      { kind: "fly", at: 2.1, dur: 0.6, from: "db", to: "app", label: "title, owner", tone: "good" },

      { kind: "fly", at: 2.8, dur: 0.6, from: "app", to: "cache", label: "keep copy" },
      { kind: "say", at: 3.4, actor: "cache", text: "has note 42", tone: "good" },
      { kind: "fly", at: 2.8, dur: 0.6, from: "app", to: "files", label: "get PDF" },
      { kind: "say", at: 3.4, actor: "files", text: "PDF sent", tone: "good" },
      { kind: "fly", at: 3.5, dur: 0.6, from: "files", to: "app", label: "PDF", tone: "good" },

      { kind: "fly", at: 4.2, dur: 0.6, from: "app", to: "queue", label: "job: count view" },
      { kind: "say", at: 4.8, actor: "queue", text: "1 job waiting", tone: "accent" },
      { kind: "verdict", at: 5.0, text: "Each kind of data has a home", tone: "accent" },
    ],
    loop: 8.0,
  },
};
