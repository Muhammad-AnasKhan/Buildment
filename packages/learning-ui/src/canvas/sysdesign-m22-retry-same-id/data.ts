import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 22.4 beat 3: the reply is lost, the phone retries with the same client id, and the service sees it already has it.
export const sysdesignM22RetrySameId: SceneSpec = {
  kind: "scene",
  title: "A retry with the same id adds no second copy",
  purpose: "Layla's phone sends a message with id 7f3 and never hears back. It sends the same message again with the same id. The chat service has seen 7f3, so it replies with the old number and saves nothing new.",
  limits: "The service remembers recent ids for each conversation, not forever. If a retry came after that memory ended, it would be saved twice, so the memory must outlast the longest retry the phone will make.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "chat", label: "Chat", kind: "server", sub: "checks the id", x: 350, y: 100 },
      { id: "layla", label: "Layla", kind: "phone", sub: "sends id 7f3", x: 70, y: 235 },
      { id: "store", label: "Store", kind: "database", sub: "empty", x: 350, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "layla", to: "chat", label: "hi, id 7f3" },
      { kind: "say", at: 1.2, actor: "chat", text: "new id: save", tone: "accent" },
      { kind: "wait", at: 1.3, dur: 1.6, actor: "layla", label: "waits {n} s", doneLabel: "timed out", total: 2 },
      { kind: "fly", at: 1.4, dur: 0.8, from: "chat", to: "store", label: "save no. 41" },
      { kind: "say", at: 2.2, actor: "store", text: "has no. 41", tone: "good" },
      { kind: "say", at: 2.3, actor: "chat", text: "reply was lost", tone: "warn" },
      { kind: "say", at: 3.0, actor: "layla", text: "no reply: retry", tone: "warn" },
      { kind: "fly", at: 3.2, dur: 0.9, from: "layla", to: "chat", label: "hi, id 7f3" },
      { kind: "say", at: 4.1, actor: "chat", text: "7f3 seen: 41", tone: "accent" },
      { kind: "fly", at: 4.4, dur: 0.9, from: "chat", to: "layla", label: "sent no. 41", tone: "good" },
      { kind: "say", at: 5.3, actor: "layla", text: "one tick", tone: "good" },
      { kind: "say", at: 5.3, actor: "store", text: "still 1 copy", tone: "good" },
      { kind: "verdict", at: 5.4, text: "Same id, one copy", tone: "good" },
    ],
    loop: 8.4,
  },
};
