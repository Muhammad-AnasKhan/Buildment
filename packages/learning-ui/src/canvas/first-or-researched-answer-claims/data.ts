import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 13 v2, chapter 5.2, beat 1: Yara (fictional) asks a chat assistant how
// to join an open source program. The answer holds two claims that sound
// sure. She checks both on the programs' own pages (Hacktoberfest 2026 page,
// Google Summer of Code FAQ; checked 2026-10-25) and the pages change both claims (B69, B70).
export const firstOrResearchedAnswerClaims: SceneSpec = {
  kind: "scene",
  title: "A fast answer with two claims to check",
  purpose:
    "Yara asks how to join an open source program. The assistant answers at once with two claims: four pull requests earn a reward, and Google Summer of Code is for students only. Yara checks both on the programs' own pages, and the pages change both claims.",
  limits:
    "The assistant's answer is invented for this example. It repeats a reward rule that the 2026 Hacktoberfest page no longer uses, and a narrower reading of who may join Google Summer of Code than its FAQ gives. Program rules change every year, so read the current pages.",
  scene: {
    width: 420,
    height: 310,
    actors: [
      { id: "yara", label: "Yara", kind: "user", sub: "8 hours a week", x: 60, y: 100 },
      { id: "ai", label: "Assistant", kind: "server", sub: "answers fast", x: 360, y: 100 },
      { id: "page", label: "Rules pages", kind: "note", sub: "2026 rules", x: 210, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1.0, from: "yara", to: "ai", label: "how do I join?" },
      { kind: "say", at: 1.4, actor: "ai", text: "2 claims", tone: "warn" },
      { kind: "fly", at: 1.6, dur: 1.0, from: "ai", to: "yara", label: "4 pull requests", tone: "warn" },
      { kind: "fly", at: 2.8, dur: 1.0, from: "ai", to: "yara", label: "students only", tone: "warn" },
      { kind: "say", at: 3.9, actor: "yara", text: "checks both" },
      { kind: "fly", at: 4.0, dur: 1.0, from: "yara", to: "page", label: "check" },
      { kind: "say", at: 5.0, actor: "page", text: "dated pages", tone: "good" },
      { kind: "fly", at: 5.1, dur: 1.0, from: "page", to: "yara", label: "no PR reward", tone: "good" },
      { kind: "fly", at: 6.3, dur: 1.0, from: "page", to: "yara", label: "beginners too", tone: "good" },
      { kind: "verdict", at: 7.4, text: "The pages change both claims", tone: "good" },
    ],
    loop: 10.5,
  },
};
