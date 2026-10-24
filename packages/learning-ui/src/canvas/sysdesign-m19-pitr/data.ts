import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 19.3 beat 4 (Rewind to the second before the delete). A full backup plus the log of changes rebuilds the database to 14:06.
export const sysdesignM19Pitr: SceneSpec = {
  kind: "scene",
  title: "A backup plus the log rebuilds 14:06",
  purpose: "A new database starts from the 02:00 backup, then replays the saved log of changes, and stops just before the bad delete at 14:07.",
  limits: "Replay speed, the 5 minute log upload and the exact stop time are simplified. A real restore creates a new database instance beside the old one.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "backup", label: "Backup", kind: "database", sub: "full, 02:00", x: 62, y: 100 },
      { id: "logs", label: "Log archive", kind: "queue", sub: "every 5 min", x: 62, y: 210 },
      { id: "fresh", label: "Restored", kind: "database", sub: "empty", x: 340, y: 155 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1.3, from: "backup", to: "fresh", label: "full copy" },
      { kind: "say", at: 1.7, actor: "fresh", text: "at 02:00", tone: "warn" },
      { kind: "fly", at: 2, dur: 1.5, from: "logs", to: "fresh", label: "replay logs" },
      { kind: "say", at: 2.6, actor: "fresh", text: "replaying", tone: "accent" },
      { kind: "say", at: 3.7, actor: "fresh", text: "at 14:06", tone: "good" },
      { kind: "mark", at: 3.7, actor: "fresh", tone: "good" },
      { kind: "verdict", at: 4, text: "Back to just before the delete", tone: "good" },
    ],
    loop: 7,
  },
};
